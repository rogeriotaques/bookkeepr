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