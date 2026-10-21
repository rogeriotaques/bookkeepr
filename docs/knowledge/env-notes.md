# Environment Notes

- Toolchain versions are pinned in `mise.toml` (Node 22, npm 11.17.0, `just`). Run `mise install` to install them; `just` remains the task runner.
- `engines` in the root, `frontend`, and `backend` `package.json` files require Node 22+ and npm 11.17.0+.
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

## Release

- `bump-and-push-docker-image.sh` requires `jq` and BSD `sed`. It uses `sed -i ''`, so GNU `sed` needs an adjusted command.
- The script requires a running Docker daemon and Docker Hub push access to `abtzco/bookkeepr`. It runs `docker login` before the push.
- The script builds `linux/amd64`, tags `abtzco/bookkeepr:<version>`, and pushes only `abtzco/bookkeepr:latest`. Push the version tag manually: `docker push abtzco/bookkeepr:<version>`.
- The script updates only `frontend/package.json` and `backend/package.json`. The root `package.json` version does not change.