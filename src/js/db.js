/**
 * SkinMatch — Module d'accès base de données Supabase
 * Agent Backend — src/js/db.js
 *
 * CRUD pour: profiles, routines, skin_tracking
 * Toutes les opérations sont protégées par RLS côté Supabase.
 *
 * Dépendances:
 *   - auth.js (doit être chargé avant)
 *   - Supabase JS CDN
 */

'use strict';

const DB_Client = (function () {

  // ── Client partagé avec auth.js ─────────────────────────────────────────────

  function _client() {
    const url = window.SKINMATCH_SUPABASE_URL;
    const key = window.SKINMATCH_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    // Réutilise le client singleton créé par auth.js si disponible
    return window.supabase.createClient(url, key);
  }

  function _handleDbError(context, error) {
    if (window.DEBUG) console.error(`[DB] ${context}:`, error);
    return error?.message || 'Erreur base de données.';
  }

  // ── Profiles ─────────────────────────────────────────────────────────────────

  const Profiles = {

    /**
     * Récupère le profil de l'utilisateur connecté
     * @returns {Promise<{ data, error }>}
     */
    async get() {
      const sb = _client();
      if (!sb) return { data: null, error: 'Client non initialisé.' };

      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .single();

      if (error) return { data: null, error: _handleDbError('profiles.get', error) };
      return { data, error: null };
    },

    /**
     * Met à jour le profil (merge partiel)
     * @param {Object} updates — clés/valeurs à mettre à jour
     * @returns {Promise<{ data, error }>}
     */
    async update(updates) {
      const sb = _client();
      if (!sb) return { data: null, error: 'Client non initialisé.' };

      // Champs autorisés uniquement (whitelist)
      const ALLOWED = ['skin_type','age_group','concerns','allergies','budget',
                       'routine_type','lang','notif_enabled','onboarding_done','avatar_url'];
      const safe = Object.fromEntries(
        Object.entries(updates).filter(([k]) => ALLOWED.includes(k))
      );

      const { data, error } = await sb
        .from('profiles')
        .update(safe)
        .select()
        .single();

      if (error) return { data: null, error: _handleDbError('profiles.update', error) };
      return { data, error: null };
    },

    /**
     * Sauvegarde le profil depuis l'état courant de l'app (ST)
     * Adapte le format ST → colonnes Supabase
     */
    async syncFromState(ST) {
      return Profiles.update({
        skin_type:    ST.skinType   || null,
        age_group:    ST.ageGroup   || null,
        concerns:     ST.concerns   || [],
        allergies:    ST.allergies  || [],
        budget:       ST.budget     || null,
        routine_type: ST.routine    || 'simple',
        lang:         (typeof I18n !== 'undefined') ? I18n.getLang() : 'fr',
        onboarding_done: true,
      });
    },
  };

  // ── Routines ─────────────────────────────────────────────────────────────────

  const Routines = {

    /**
     * Récupère la routine active de l'utilisateur
     * @returns {Promise<{ data, error }>}
     */
    async getActive() {
      const sb = _client();
      if (!sb) return { data: null, error: 'Client non initialisé.' };

      const { data, error } = await sb
        .from('routines')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return { data: null, error: _handleDbError('routines.getActive', error) };
      return { data, error: null };
    },

    /**
     * Récupère l'historique des routines (dernières N)
     * @param {number} limit
     * @returns {Promise<{ data, error }>}
     */
    async getHistory(limit = 10) {
      const sb = _client();
      if (!sb) return { data: null, error: 'Client non initialisé.' };

      const { data, error } = await sb
        .from('routines')
        .select('id, created_at, total_prix, intro, profile_snapshot, is_active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return { data: null, error: _handleDbError('routines.getHistory', error) };
      return { data, error: null };
    },

    /**
     * Sauvegarde une nouvelle routine (archive les précédentes)
     * @param {Object} profile — snapshot du profil
     * @param {Object} result  — résultat de SkinMatchAlgo.generateRoutine()
     * @param {string} lang    — langue courante
     * @returns {Promise<{ data, error }>}
     */
    async save(profile, result, lang = 'fr') {
      const sb = _client();
      if (!sb) return { data: null, error: 'Client non initialisé.' };

      // Archiver les routines actives précédentes
      await sb
        .from('routines')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insérer la nouvelle routine
      const { data, error } = await sb
        .from('routines')
        .insert({
          profile_snapshot: profile,
          steps:            result.steps || [],
          intro:            result.intro || null,
          conseil:          result.conseil || null,
          total_prix:       result.totalPrix || null,
          lang,
          algo_version:     '1.0',
          is_active:        true,
        })
        .select()
        .single();

      if (error) return { data: null, error: _handleDbError('routines.save', error) };
      return { data, error: null };
    },

    /**
     * Supprime une routine spécifique
     */
    async delete(routineId) {
      const sb = _client();
      if (!sb) return { error: 'Client non initialisé.' };

      const { error } = await sb
        .from('routines')
        .delete()
        .eq('id', routineId);

      if (error) return { error: _handleDbError('routines.delete', error) };
      return { error: null };
    },
  };

  // ── Skin Tracking ─────────────────────────────────────────────────────────────

  const Tracking = {

    /**
     * Ajoute un check-in de suivi peau
     * @param {Object} entry — { hydration, oiliness, sensitivity, glow, routine_rating, note, season, stress_level }
     * @param {string|null} routineId — UUID de la routine associée (optionnel)
     * @returns {Promise<{ data, error }>}
     */
    async add(entry, routineId = null) {
      const sb = _client();
      if (!sb) return { data: null, error: 'Client non initialisé.' };

      const { data, error } = await sb
        .from('skin_tracking')
        .insert({
          routine_id:     routineId,
          hydration:      entry.hydration      ?? null,
          oiliness:       entry.oiliness       ?? null,
          sensitivity:    entry.sensitivity    ?? null,
          glow:           entry.glow           ?? null,
          routine_rating: entry.routine_rating ?? null,
          note:           entry.note?.slice(0, 500) || null,
          season:         entry.season         ?? null,
          stress_level:   entry.stress_level   ?? null,
        })
        .select()
        .single();

      if (error) return { data: null, error: _handleDbError('tracking.add', error) };
      return { data, error: null };
    },

    /**
     * Historique des check-ins (pour graphes d'évolution)
     * @param {number} days — fenêtre en jours (défaut: 30)
     * @returns {Promise<{ data, error }>}
     */
    async getHistory(days = 30) {
      const sb = _client();
      if (!sb) return { data: null, error: 'Client non initialisé.' };

      const since = new Date(Date.now() - days * 86400_000).toISOString();

      const { data, error } = await sb
        .from('skin_tracking')
        .select('created_at, hydration, oiliness, sensitivity, glow, routine_rating')
        .gte('created_at', since)
        .order('created_at', { ascending: true });

      if (error) return { data: null, error: _handleDbError('tracking.getHistory', error) };
      return { data, error: null };
    },

    /**
     * Calcule les moyennes sur une période pour le dashboard
     * @param {number} days
     * @returns {Promise<{ data: { hydration, oiliness, sensitivity, glow, rating, count }, error }>}
     */
    async getAverages(days = 30) {
      const { data, error } = await Tracking.getHistory(days);
      if (error) return { data: null, error };

      if (!data || data.length === 0) {
        return { data: { hydration: null, oiliness: null, sensitivity: null,
                         glow: null, rating: null, count: 0 }, error: null };
      }

      const avg = key => {
        const vals = data.map(d => d[key]).filter(v => v != null);
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
      };

      return {
        data: {
          hydration:   avg('hydration'),
          oiliness:    avg('oiliness'),
          sensitivity: avg('sensitivity'),
          glow:        avg('glow'),
          rating:      avg('routine_rating'),
          count:       data.length,
        },
        error: null,
      };
    },
  };

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  const Dashboard = {

    /**
     * Charge toutes les données pour le dashboard en une seule requête
     * Utilise la vue user_dashboard définie dans la migration 001
     * @returns {Promise<{ data, error }>}
     */
    async load() {
      const sb = _client();
      if (!sb) return { data: null, error: 'Client non initialisé.' };

      const { data, error } = await sb
        .from('user_dashboard')
        .select('*')
        .single();

      if (error) return { data: null, error: _handleDbError('dashboard.load', error) };
      return { data, error: null };
    },
  };

  // ── Intégration avec l'app ────────────────────────────────────────────────────

  /**
   * Sauvegarde automatique après génération de routine
   * À appeler depuis doGenerate() dans ui.js
   */
  async function autoSaveRoutine(ST, result) {
    const isAuth = typeof Auth !== 'undefined' && await Auth.isAuthenticated();
    if (!isAuth) return; // Pas connecté → pas de sauvegarde

    const profile = {
      skinType:  ST.skinType,
      ageGroup:  ST.ageGroup,
      concerns:  ST.concerns,
      allergies: ST.allergies,
      budget:    ST.budget,
      routine:   ST.routine,
    };

    const lang = (typeof I18n !== 'undefined') ? I18n.getLang() : 'fr';
    const { error } = await Routines.save(profile, result, lang);

    if (error && window.DEBUG) console.warn('[DB] Sauvegarde routine échouée:', error);
  }

  // ── Export public ─────────────────────────────────────────────────────────────

  return {
    Profiles,
    Routines,
    Tracking,
    Dashboard,
    autoSaveRoutine,
  };

})();

// Exposer globalement
if (typeof window !== 'undefined') {
  window.DB_Client = DB_Client;
}
