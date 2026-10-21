# Tech Stack

- **Frontend**: Vue 3.4+, Vite, Vue Router, Vue Query, Chart.js
- **Backend**: Node.js 22+, Express, Knex, SQLite
- **Package manager**: npm (`package-lock.json` v3 in `frontend` and `backend`)
- **Task runner**: `just` (see `Justfile`; run `just --list`)
- **Toolchain**: `mise` (see `mise.toml`; pins Node 22, npm 11.17.0, and `just`)
- **Container**: `node:22-alpine3.19`, dependencies installed with `npm ci`, runs `pm2-runtime main.js`