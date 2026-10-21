# Commands

This project uses [`just`](https://github.com/casey/just) as task runner. Run `just` (or `just --list`) to see the recipes.

Optionally, install the pinned toolchain with [`mise`](https://mise.jdx.dev) (`mise.toml`):

```sh
mise install
```

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

## Release (maintainers)

`bump-and-push-docker-image.sh` (repository root) bumps the `frontend` and `backend` `package.json` versions, commits and tags the bump, pushes the commit and the tag, then builds and pushes the amd64 Docker image. It pushes both `:latest` and `:<version>`.

```sh
./bump-and-push-docker-image.sh             # bump, then publish
./bump-and-push-docker-image.sh --no-bump   # publish an already-updated version
./bump-and-push-docker-image.sh --help
```

The default mode prompts for the new version. `--no-bump` skips the prompt and the `sed` calls, reads the version from `frontend/package.json` and `backend/package.json`, and stops if the two versions differ. It commits the files only when they have uncommitted changes and creates the tag only when it does not already exist.

The script requires:

- Docker is running.
- `jq` is installed.
- BSD `sed` (macOS). The script calls `sed -i ''` and fails on GNU `sed`.
- Push access to `abtzco/bookkeepr` on Docker Hub. The script runs `docker login`.
- A clean working tree. The script runs `git add` and `git commit` on the two `package.json` files.

The script pushes both `:latest` and `:<version>`. Production deploys use the version tag, so a rollback can pull the previous image.

Production deploy: see [deployment.md](deployment.md).
