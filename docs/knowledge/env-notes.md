# Environment Notes

- Node versions are managed via Volta (check `package.json` volta field)
- If SQLite/node-gyp issues occur, downgrade sqlite to `^5.0.0` and run `npm install -g node-gyp`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:8083` | Comma-separated list of allowed CORS origins. In production, set this to a single domain (no trailing comma). Local dev does not rely on this because the Vite proxy handles same-origin routing. |

## Docker

- Base image `node:22-alpine3.19` ships npm 10.9, but the committed lockfiles come from npm 11. `npm ci` with npm 10 fails with `Missing: @esbuild/linux-*@0.28.2 from lock file`; the Dockerfile pins `npm@11.17.0`.
- `sqlite3` resolves a prebuilt binary on Alpine/musl for both `linux/arm64` and `linux/amd64`. No build tools are needed.
- Use `**/node_modules/` and `**/dist/` in `.dockerignore`. Bare `node_modules/` does not match nested folders.
- `docker build --platform <foreign>` needs BuildKit or buildx. A daemon without BuildKit fails at the first `COPY` step with "does not provide the specified platform".
- The container serves the API and the built SPA on port 8083. Mount `/bookkeepr/data` to persist the SQLite database.