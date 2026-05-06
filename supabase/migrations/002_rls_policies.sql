-- ============================================================
-- SkinMatch — Migration 002 : Row Level Security
-- Agent Backend — supabase/migrations/002_rls_policies.sql
--
-- Principe: chaque utilisateur ne voit et ne modifie
--           QUE ses propres données. Aucune exception.
-- ============================================================

-- ─── Activer RLS sur toutes les tables ────────────────────────────────────────

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_tracking ENABLE ROW LEVEL SECURITY;

-- ─── Policies: profiles ───────────────────────────────────────────────────────

-- SELECT: un user ne voit que son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT: un user ne peut créer que son propre profil
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: un user ne peut modifier que son propre profil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: pas de suppression directe (passe par auth.users CASCADE)
-- Note: la suppression du compte dans auth.users cascade sur profiles

-- ─── Policies: routines ───────────────────────────────────────────────────────

CREATE POLICY "routines_select_own"
  ON public.routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "routines_insert_own"
  ON public.routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines_update_own"
  ON public.routines FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines_delete_own"
  ON public.routines FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Policies: skin_tracking ──────────────────────────────────────────────────

CREATE POLICY "tracking_select_own"
  ON public.skin_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tracking_insert_own"
  ON public.skin_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tracking_update_own"
  ON public.skin_tracking FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tracking_delete_own"
  ON public.skin_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Fonction: création automatique du profil après signup ───────────────────
-- Déclenché par auth.users INSERT (via Supabase Auth hook)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, lang)
  VALUES (
    NEW.id,
    COALESCE(
      -- Essayer de récupérer la langue depuis les metadata du signup
      (NEW.raw_user_meta_data->>'lang')::TEXT,
      'fr'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger sur auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Fonction: anonymisation RGPD ────────────────────────────────────────────
-- Appelée via RPC quand l'utilisateur demande la suppression de son compte
-- Anonymise les données avant suppression (audit trail)

CREATE OR REPLACE FUNCTION public.anonymize_user_data(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  -- Vérifier que l'appelant est bien le propriétaire des données
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Anonymiser le profil
  UPDATE public.profiles SET
    skin_type  = NULL,
    age_group  = NULL,
    concerns   = '{}',
    allergies  = '{}',
    avatar_url = NULL,
    lang       = 'fr'
  WHERE id = p_user_id;

  -- Supprimer les données de tracking (données de santé = sensibles)
  DELETE FROM public.skin_tracking WHERE user_id = p_user_id;

  -- Garder les routines mais anonymiser les snapshots
  UPDATE public.routines SET
    profile_snapshot = '{"anonymized": true}'::JSONB
  WHERE user_id = p_user_id;
END;
$$;

-- ─── Permissions: vue user_dashboard ─────────────────────────────────────────
-- La vue hérite des policies des tables sous-jacentes
-- Pas besoin de RLS sur la vue si RLS activé sur les tables

GRANT SELECT ON public.user_dashboard TO authenticated;
GRANT ALL ON public.profiles          TO authenticated;
GRANT ALL ON public.routines          TO authenticated;
GRANT ALL ON public.skin_tracking     TO authenticated;

-- Révoquer l'accès public (anon) à toutes les tables
REVOKE ALL ON public.profiles          FROM anon;
REVOKE ALL ON public.routines          FROM anon;
REVOKE ALL ON public.skin_tracking     FROM anon;
REVOKE ALL ON public.user_dashboard    FROM anon;
