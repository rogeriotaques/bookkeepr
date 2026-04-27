# Architecture

## Backend (`/backend`)
- Express API with Knex ORM + SQLite
- Routes organized by domain: `auth`, `entries`, `groups`, `reports`, `settings`, `wallets`
- Each route has a corresponding controller and index route file
- Database migrations in `migrations/` directory
- Uses `module-alias` (`@` maps to backend root)

## Frontend (`/frontend/src`)
- Vue 3 Composition API with `<script setup>` syntax
- Pages in `pages/`: `AuthPage`, `FirstAccessPage`, `NewEntryPage`, `ReportPage`, and Settings variants
- Components in `components/` organized by feature: `navigation`, `new-entry`, `report`, `settings`, `shared`
- Composables in `composable/`: `useDataFetch`, `useState`
- Domain logic in `domain/`: `constants.ts`, `interfaces.ts`, `network/`, `router/`, `utils.ts`

## Security Decisions (Do Not Flag as Vulnerabilities)

### `GET /api/settings` is intentionally public
The frontend must call this **before** authenticating to read `usePasswd` (boolean) and decide whether to show the login form. The controller filters out the actual `passwd` hash via `KEY_BLACK_LIST`, so no sensitive data is exposed. Adding auth here creates a chicken-and-egg problem.

### CORS in development
The backend uses a strict CORS whitelist (`CORS_ORIGIN` env var, defaults to `localhost:5173,localhost:8083`). In local development, the Vite dev server proxies `/api` to `localhost:8083`, so the browser sees same-origin requests and CORS is never triggered. The whitelist only matters for production deployments where the frontend and backend are served from separate domains.

### Authentication model
- Single-user basic auth (username is always `user`).
- Passwords are hashed with PBKDF2 (100k iterations, SHA-512, 64-byte key, random 16-byte salt) stored as `salt:hash`.
- Old unsalted SHA-256 passwords still verify and are **automatically migrated to PBKDF2 on first successful login**.
- `backend/lib/auth.js` is the single source of truth for hashing and verification. Both `backend/controllers/auth.js` and `backend/middleware/basicAuth.js` use it.

### `safeCompare` fix
`backend/middleware/basicAuth.js` previously contained a broken `safeCompare` that compared zero-filled buffers (allowing any same-length strings to match). This was replaced with a proper `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))` check.

### SQL injection fix
`backend/controllers/entries.js` previously interpolated `year` and `month` directly into a `whereRaw` template string. This was replaced with parameterized bindings: `.whereRaw("strftime('%Y', entries.date) = ? AND strftime('%m', entries.date) = ?", [year, month])`.