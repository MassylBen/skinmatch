# Agent Backend — SkinMatch

## Périmètre STRICT
- `supabase/migrations/`
- `src/js/auth.js`
- `src/js/db.js`

## État actuel — IMPLÉMENTÉ ✅
```
supabase/migrations/001_initial_schema.sql  — Tables profiles/routines/skin_tracking + vue dashboard
supabase/migrations/002_rls_policies.sql    — RLS + trigger auto-profil + anonymisation RGPD
src/js/auth.js                              — Client Auth Supabase (305 lignes)
src/js/db.js                               — CRUD DB (345 lignes)
```

## Stack
- **Auth** : Supabase Auth (email/password + OAuth Google)
- **DB** : Supabase PostgreSQL avec RLS sur toutes les tables
- **Secrets** : Variables d'environnement Vercel — jamais dans le code

## Variables d'environnement — NOMS EXACTS (ne pas changer)
```js
// Côté navigateur (injectées dans index.html par Vercel)
window.SKINMATCH_SUPABASE_URL      // URL du projet Supabase
window.SKINMATCH_SUPABASE_ANON_KEY // Clé anon publique (safe côté client)
window.DEBUG                        // true si localhost

// Côté GitHub Actions (secrets du repo)
SUPABASE_URL
SUPABASE_ANON_KEY
VERCEL_TOKEN / VERCEL_ORG_ID / VERCEL_PROJECT_ID
```

## Schéma de base de données — tel qu'implémenté

### Table `profiles` (1:1 avec auth.users)
```sql
id            UUID PK → auth.users(id)
skin_type     TEXT CHECK IN ('seche','grasse','mixte','normale','sensible')
age_group     TEXT CHECK IN ('moins-25','26-35','36-45','plus-45')
concerns      TEXT[]  DEFAULT '{}'
allergies     TEXT[]  DEFAULT '{}'
budget        TEXT CHECK IN ('low','mid','high')
routine_type  TEXT CHECK IN ('simple','complete','specifique')
lang          TEXT DEFAULT 'fr'
notif_enabled BOOLEAN DEFAULT FALSE
onboarding_done BOOLEAN DEFAULT FALSE
avatar_url    TEXT
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ  -- auto-mis à jour par trigger
```

### Table `routines`
```sql
id               UUID PK
user_id          UUID → profiles(id) CASCADE
profile_snapshot JSONB  -- snapshot du profil au moment de la génération
steps            JSONB  -- résultat de generateRoutine()
intro            TEXT
conseil          TEXT
total_prix       NUMERIC(8,2)
lang             TEXT
algo_version     TEXT DEFAULT '1.0'
is_active        BOOLEAN DEFAULT TRUE  -- une seule active par user
created_at       TIMESTAMPTZ
```

### Table `skin_tracking`
```sql
id              UUID PK
user_id         UUID → profiles(id) CASCADE
routine_id      UUID → routines(id) SET NULL
hydration       SMALLINT 1-5
oiliness        SMALLINT 1-5
sensitivity     SMALLINT 1-5
glow            SMALLINT 1-5
routine_rating  SMALLINT 1-5
note            TEXT max 500 chars
season          TEXT IN ('printemps','ete','automne','hiver')
stress_level    SMALLINT 1-5
created_at      TIMESTAMPTZ
```

### Vue `user_dashboard`
LATERAL JOIN sur les 3 tables — charge tout le dashboard en 1 requête.

## API publique de auth.js — window.Auth

```js
Auth.register(email, password, meta)   // → { user, error }
Auth.login(email, password)            // → { user, session, error }
Auth.loginWithGoogle()                 // → redirect OAuth
Auth.resetPassword(email)             // → { error }
Auth.logout()                         // → void
Auth.getSession()                     // → { session, user }
Auth.isAuthenticated()                // → Promise<boolean>
Auth.onAuthChange(callback)           // → unsubscribe fn
Auth.bindToUI()                       // branche doLogin/doRegister globaux
```

L'event `skinmatch:auth` est émis sur `document` avec `{ event, user }`.
`event` vaut `'SIGNED_IN'` | `'SIGNED_OUT'` | `'TOKEN_REFRESHED'` | `'USER_UPDATED'`.

## API publique de db.js — window.DB_Client

```js
DB_Client.Profiles.get()              // → { data, error }
DB_Client.Profiles.update(fields)     // → { data, error }  — whitelist de champs
DB_Client.Profiles.syncFromState(ST)  // → sync depuis l'état global de l'app

DB_Client.Routines.getActive()        // → { data, error }
DB_Client.Routines.getHistory(n)      // → { data, error }  — dernières n routines
DB_Client.Routines.save(profile, result, lang) // archive les précédentes, insère
DB_Client.Routines.delete(id)         // → { error }

DB_Client.Tracking.add(entry, routineId)  // → { data, error }
DB_Client.Tracking.getHistory(days)       // → { data, error }
DB_Client.Tracking.getAverages(days)      // → { data: {hydration,glow,...,count}, error }

DB_Client.Dashboard.load()            // → { data, error }  — via vue user_dashboard
DB_Client.autoSaveRoutine(ST, result) // non-bloquant, vérifie l'auth avant d'enregistrer
```

## RLS — Règles en vigueur
Chaque utilisateur ne peut lire/écrire que ses propres données. Vérifié via `auth.uid()`.
Triggers actifs :
- `handle_updated_at` — met à jour `profiles.updated_at` automatiquement
- `handle_new_user` — crée le profil dans `profiles` lors d'un signup (SECURITY DEFINER)
- `anonymize_user_data(user_id)` — RPC pour suppression RGPD (soft delete)

## Déploiement migrations Supabase
```bash
# Depuis le répertoire du projet, une fois Supabase CLI installé
supabase db push    # applique les migrations non encore jouées
supabase db reset   # repart de zéro (DESTRUCTIF — dev uniquement)
```

## Interdictions
- **Jamais** utiliser la `service_role` key côté client (utiliser anon key uniquement)
- **Jamais** stocker de tokens JWT manuellement en localStorage (Supabase le gère)
- **Jamais** bypasser le RLS (pas de client avec service_role côté navigateur)
- **Jamais** modifier `src/js/ui.js` ou `src/js/i18n.js` (hors périmètre)
- **Jamais** logger des données personnelles (email, allergies) en clair côté client

## MCP Servers assignés

| Serveur | Usage dans ce périmètre |
|---------|------------------------|
| `filesystem` | Lire/écrire `supabase/migrations/`, `auth.js`, `db.js` |
| `supabase` | Inspecter le schéma DB, exécuter des requêtes de vérification RLS, contrôler l'état des tables en production |
| `sequential-thinking` | Raisonner sur les migrations SQL complexes, les implications RLS, les cascades avant d'écrire du SQL |
