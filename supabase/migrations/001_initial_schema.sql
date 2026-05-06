-- ============================================================
-- SkinMatch — Migration 001 : Schéma initial
-- Agent Backend — supabase/migrations/001_initial_schema.sql
--
-- Tables:
--   profiles        → données utilisateur (skin profile)
--   routines        → routines générées + historique
--   skin_tracking   → suivi évolution peau dans le temps
-- ============================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Recherche fuzzy sur produits

-- ─── Table: profiles ──────────────────────────────────────────────────────────
-- Profil persistant lié à auth.users (1:1)

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Préférences peau
  skin_type     TEXT CHECK (skin_type IN ('seche','grasse','mixte','normale','sensible')),
  age_group     TEXT CHECK (age_group IN ('moins-25','26-35','36-45','plus-45')),
  concerns      TEXT[]  DEFAULT '{}',   -- ex: ['rides','taches','eclat']
  allergies     TEXT[]  DEFAULT '{}',   -- ex: ['Rétinol','Parfums']
  budget        TEXT    CHECK (budget IN ('low','mid','high')),
  routine_type  TEXT    CHECK (routine_type IN ('simple','complete','specifique')) DEFAULT 'simple',

  -- Préférences app
  lang          TEXT    DEFAULT 'fr'    CHECK (lang IN ('fr','en','es','de','ar')),
  notif_enabled BOOLEAN DEFAULT FALSE,

  -- Méta
  onboarding_done BOOLEAN DEFAULT FALSE,
  avatar_url    TEXT    -- URL externe uniquement (pas d'upload serveur)
);

-- Trigger: mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Table: routines ──────────────────────────────────────────────────────────
-- Historique des routines générées par utilisateur

CREATE TABLE IF NOT EXISTS public.routines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Snapshot du profil au moment de la génération
  profile_snapshot  JSONB NOT NULL,
  -- { skinType, ageGroup, concerns, allergies, budget, routine }

  -- Résultat de l'algorithme
  steps         JSONB NOT NULL,
  -- [ { stepType, nom, marque, prix_num, moment, score, ... } ]

  intro         TEXT,
  conseil       TEXT,
  total_prix    NUMERIC(8,2),

  -- Métadonnées
  lang          TEXT DEFAULT 'fr',
  algo_version  TEXT DEFAULT '1.0',  -- permet de re-générer si algo change
  is_active     BOOLEAN DEFAULT TRUE  -- routine courante vs archivée
);

-- Index: récupérer les routines d'un user triées par date
CREATE INDEX routines_user_created
  ON public.routines (user_id, created_at DESC);

-- Index: rechercher les routines actives
CREATE INDEX routines_active
  ON public.routines (user_id, is_active)
  WHERE is_active = TRUE;

-- ─── Table: skin_tracking ─────────────────────────────────────────────────────
-- Suivi évolution de la peau dans le temps (check-ins périodiques)

CREATE TABLE IF NOT EXISTS public.skin_tracking (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  routine_id    UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Évaluation subjective (1-5)
  hydration     SMALLINT CHECK (hydration BETWEEN 1 AND 5),
  oiliness      SMALLINT CHECK (oiliness BETWEEN 1 AND 5),
  sensitivity   SMALLINT CHECK (sensitivity BETWEEN 1 AND 5),
  glow          SMALLINT CHECK (glow BETWEEN 1 AND 5),

  -- Note globale sur la routine
  routine_rating SMALLINT CHECK (routine_rating BETWEEN 1 AND 5),

  -- Commentaire libre (limité pour éviter stockage excessif)
  note          TEXT CHECK (char_length(note) <= 500),

  -- Contexte environnemental (optionnel, saisi par l'user)
  season        TEXT CHECK (season IN ('printemps','ete','automne','hiver')),
  stress_level  SMALLINT CHECK (stress_level BETWEEN 1 AND 5)
);

-- Index: historique de tracking par user
CREATE INDEX skin_tracking_user_created
  ON public.skin_tracking (user_id, created_at DESC);

-- ─── Vue: user_dashboard ──────────────────────────────────────────────────────
-- Vue agrégée pour le dashboard utilisateur (évite N+1 queries)

CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT
  p.id,
  p.skin_type,
  p.age_group,
  p.concerns,
  p.lang,
  p.onboarding_done,

  -- Routine active courante
  r.id              AS routine_id,
  r.created_at      AS routine_created_at,
  r.steps           AS routine_steps,
  r.total_prix      AS routine_total_prix,
  r.intro           AS routine_intro,

  -- Dernière évaluation
  st.created_at     AS last_tracking_date,
  st.routine_rating AS last_rating,
  st.hydration      AS last_hydration,
  st.glow           AS last_glow

FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT * FROM public.routines
  WHERE user_id = p.id AND is_active = TRUE
  ORDER BY created_at DESC LIMIT 1
) r ON TRUE
LEFT JOIN LATERAL (
  SELECT * FROM public.skin_tracking
  WHERE user_id = p.id
  ORDER BY created_at DESC LIMIT 1
) st ON TRUE;
