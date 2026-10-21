# Commands

This project uses [`just`](https://github.com/casey/just) as task runner. Run `just` (or `just --list`) to see the recipes.

```sh
# Install dependencies (root, frontend, backend)
just install

# Backend (runs on port 8083)
just start-backend

# Frontend (runs on port 5173)
just start-frontend

# Both, from the repository root
just start

# Build frontend for production
just build

# Watch mode for frontend builds
(cd frontend; npm run watch)

# Tests
just test           # frontend and backend
just test-frontend
just test-backend
```

## Without `just`

```sh
# Install dependencies
(cd frontend; npm install)
(cd backend; npm install)

# Backend (runs on port 8083)
(cd backend; npm start)

# Frontend (runs on port 5173)
(cd frontend; npm start)

# Both, from the repository root
npm start

# Build frontend for production
(cd frontend; npm run build)

# Tests
(cd frontend; npm test)
(cd backend; npm test)
```

## Docker

```sh
# Build (match the target server platform)
just docker-build --platform linux/amd64

# Run locally (data persists in ./tmp-data on the host)
just docker-run

# Stop and remove the local container
just docker-stop
```

Equivalent commands without `just`:

```sh
docker build --platform linux/amd64 -t abtzco/bookkeepr:latest .
docker run --rm --name bookkeepr -p 8090:8083 -v "$PWD/tmp-data:/bookkeepr/data" abtzco/bookkeepr:latest
docker rm -f bookkeepr
```

- The image builds the SPA and installs backend production deps with `npm ci`.
- npm 11.17.0 is pinned in the image. The base image ships npm 10, which rejects the committed lockfiles.
- `.dockerignore` must keep `**/node_modules/` and `**/dist/`. Bare patterns only match the repository root and add ~550 MB to the build context.
- `--platform` builds need BuildKit or buildx.
