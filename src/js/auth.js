/**
 * SkinMatch — Module d'authentification Supabase
 * Agent Backend — src/js/auth.js
 *
 * Remplace les fonctions doLogin() / doRegister() factices de ui.js
 * Expose: Auth.login, Auth.register, Auth.logout, Auth.getSession, Auth.onAuthChange
 *
 * Dépendances:
 *   - Supabase JS CDN (chargé avant ce script dans index.html)
 *   - ENV: window.SKINMATCH_SUPABASE_URL, window.SKINMATCH_SUPABASE_ANON_KEY
 */

'use strict';

const Auth = (function () {

  // ── Client Supabase ─────────────────────────────────────────────────────────

  let _client = null;

  function _getClient() {
    if (_client) return _client;

    const url = window.SKINMATCH_SUPABASE_URL;
    const key = window.SKINMATCH_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('[Auth] Variables SKINMATCH_SUPABASE_URL / SKINMATCH_SUPABASE_ANON_KEY manquantes.');
      return null;
    }

    _client = window.supabase.createClient(url, key, {
      auth: {
        autoRefreshToken:   true,
        persistSession:     true,
        detectSessionInUrl: true,
        storage:            window.localStorage,
      },
    });

    return _client;
  }

  // ── Helpers internes ────────────────────────────────────────────────────────

  function _handleError(context, error) {
    if (window.DEBUG) {
      console.error(`[Auth] ${context}:`, error);
    }
    // Messages d'erreur lisibles par l'utilisateur
    const MAP = {
      'Invalid login credentials':        'Email ou mot de passe incorrect.',
      'Email not confirmed':              'Confirmez votre email avant de vous connecter.',
      'User already registered':          'Un compte existe déjà avec cet email.',
      'Password should be at least 6 characters': 'Le mot de passe doit faire au moins 6 caractères.',
      'Rate limit exceeded':              'Trop de tentatives. Réessayez dans quelques minutes.',
    };
    return MAP[error.message] || 'Une erreur est survenue. Réessayez.';
  }

  // ── Auth: inscription ───────────────────────────────────────────────────────

  /**
   * Créer un compte + profil initial
   * @param {string} email
   * @param {string} password
   * @param {Object} meta — { lang } optionnel
   * @returns {Promise<{ user, error }>}
   */
  async function register(email, password, meta = {}) {
    const client = _getClient();
    if (!client) return { user: null, error: 'Configuration Supabase manquante.' };

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { lang: meta.lang || 'fr' },
        // L'email de confirmation est envoyé automatiquement par Supabase
      },
    });

    if (error) return { user: null, error: _handleError('register', error) };

    // Le trigger handle_new_user() crée automatiquement le profil
    return { user: data.user, error: null };
  }

  // ── Auth: connexion ─────────────────────────────────────────────────────────

  /**
   * Connexion email/password
   * @returns {Promise<{ user, session, error }>}
   */
  async function login(email, password) {
    const client = _getClient();
    if (!client) return { user: null, session: null, error: 'Configuration Supabase manquante.' };

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) return { user: null, session: null, error: _handleError('login', error) };

    return { user: data.user, session: data.session, error: null };
  }

  // ── Auth: connexion Google OAuth ─────────────────────────────────────────────

  /**
   * Connexion via Google (OAuth redirect)
   * Redirige vers Google, puis revient sur l'app avec session active
   */
  async function loginWithGoogle() {
    const client = _getClient();
    if (!client) return { error: 'Configuration Supabase manquante.' };

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/?source=oauth`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) return { error: _handleError('loginWithGoogle', error) };
    return { error: null }; // La page va se rediriger
  }

  // ── Auth: mot de passe oublié ─────────────────────────────────────────────

  /**
   * Envoi du lien de réinitialisation de mot de passe
   */
  async function resetPassword(email) {
    const client = _getClient();
    if (!client) return { error: 'Configuration Supabase manquante.' };

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?action=update-password`,
    });

    if (error) return { error: _handleError('resetPassword', error) };
    return { error: null };
  }

  // ── Auth: déconnexion ────────────────────────────────────────────────────────

  async function logout() {
    const client = _getClient();
    if (!client) return;

    await client.auth.signOut();
    // La UI réagit via onAuthChange → état 'SIGNED_OUT'
  }

  // ── Session ──────────────────────────────────────────────────────────────────

  /**
   * Récupère la session courante (null si non connecté)
   * @returns {Promise<{ session, user }>}
   */
  async function getSession() {
    const client = _getClient();
    if (!client) return { session: null, user: null };

    const { data } = await client.auth.getSession();
    return {
      session: data.session,
      user:    data.session?.user ?? null,
    };
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {Promise<boolean>}
   */
  async function isAuthenticated() {
    const { user } = await getSession();
    return !!user;
  }

  // ── Listener de changement d'état ────────────────────────────────────────────

  /**
   * S'abonner aux changements d'état auth
   * @param {Function} callback — ({ event, session }) => void
   *   event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED'
   * @returns {Function} unsubscribe
   */
  function onAuthChange(callback) {
    const client = _getClient();
    if (!client) return () => {};

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      callback({ event, session, user: session?.user ?? null });
    });

    return () => subscription.unsubscribe();
  }

  // ── Intégration UI: remplace les fonctions factices de ui.js ────────────────

  /**
   * À appeler dans DOMContentLoaded pour brancher Auth sur les formulaires
   * existants de ui.js (doLogin / doRegister)
   */
  function bindToUI() {
    // Remplacer doLogin global
    window.doLogin = async function () {
      const email    = document.getElementById('loginEmail')?.value?.trim();
      const password = document.getElementById('loginPassword')?.value;

      if (!email || !password) {
        _showAuthError('Remplissez email et mot de passe.');
        return;
      }

      _setAuthLoading(true);
      const { user, error } = await login(email, password);
      _setAuthLoading(false);

      if (error) { _showAuthError(error); return; }

      // Succès: fermer modal, notifier l'app
      document.dispatchEvent(new CustomEvent('skinmatch:auth', {
        detail: { event: 'SIGNED_IN', user }
      }));
      if (typeof go === 'function') go('home');
    };

    // Remplacer doRegister global
    window.doRegister = async function () {
      const email    = document.getElementById('regEmail')?.value?.trim();
      const password = document.getElementById('regPassword')?.value;
      const lang     = (typeof I18n !== 'undefined') ? I18n.getLang() : 'fr';

      if (!email || !password) {
        _showAuthError('Remplissez email et mot de passe.');
        return;
      }

      _setAuthLoading(true);
      const { user, error } = await register(email, password, { lang });
      _setAuthLoading(false);

      if (error) { _showAuthError(error); return; }

      _showAuthError('Compte créé ! Vérifiez vos emails pour confirmer.', 'success');
    };

    // Écouter les changements d'état pour mettre à jour l'UI
    onAuthChange(({ event, user }) => {
      document.dispatchEvent(new CustomEvent('skinmatch:auth', { detail: { event, user } }));
    });
  }

  function _showAuthError(msg, type = 'error') {
    const el = document.getElementById('authError') || document.getElementById('loginError');
    if (!el) return;
    el.textContent  = msg;
    el.style.color  = type === 'success' ? '#4CAF50' : '#C4726A';
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }

  function _setAuthLoading(loading) {
    const btn = document.getElementById('loginBtn') || document.getElementById('submitLogin');
    if (!btn) return;
    btn.disabled    = loading;
    btn.textContent = loading ? 'Connexion…' : 'Se connecter';
  }

  // ── Export public ────────────────────────────────────────────────────────────

  return {
    register,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
    getSession,
    isAuthenticated,
    onAuthChange,
    bindToUI,
  };

})();

// Exposer globalement
if (typeof window !== 'undefined') {
  window.Auth = Auth;

  // Auto-bind quand le DOM est prêt
  document.addEventListener('DOMContentLoaded', function () {
    Auth.bindToUI();

    // Vérifier la session au chargement (ex: retour OAuth)
    Auth.getSession().then(({ user }) => {
      if (user) {
        document.dispatchEvent(new CustomEvent('skinmatch:auth', {
          detail: { event: 'SIGNED_IN', user }
        }));
      }
    });
  });
}
