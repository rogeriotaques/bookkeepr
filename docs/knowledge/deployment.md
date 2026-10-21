# Deployment

BookKeepr runs in production as a Docker container on vps-4, behind the HestiaCP nginx reverse proxy.

```
client → nginx :443 (TLS) → 127.0.0.1:8083 → container bookkeepr → /bookkeepr/data/bookkeepr.db
```

## Server

| Item | Value |
|---|---|
| Host | vps-4, `n4.abtz.co` |
| IP | `139.162.111.88` |
| Arch | `x86_64` |
| Site path | `/home/abtz/web/bookkeepr.abtz.co` |
| Data | `/home/abtz/web/bookkeepr.abtz.co/data/bookkeepr.db` |
| Container | `bookkeepr` |
| Image | `abtzco/bookkeepr:<version>` |
| Port | `127.0.0.1:8083:8083` |
| Restart policy | `always` |
| Health | `http://127.0.0.1:8083/api/settings` |
| Public URL | `https://bookkeepr.abtz.co/` |

The HestiaCP vhosts (`nginx.conf`, `nginx.ssl.conf`) proxy to `127.0.0.1:8083`. HTTP requests redirect to HTTPS.

## Access

The deploy user must run docker without sudo:

```sh
# Once, as root
usermod -aG docker abtz
```

Use `abtz@139.162.111.88` with `~/.ssh/linode_rsa`. `abtz` owns `data/`, so it can back up the database.

`admin` is not suitable: its NOPASSWD sudoers rule covers only `/usr/local/hestia/bin/*`, and it cannot read `data/` (mode `764 abtz:abtz`). Root SSH with `linode_rsa` works but is not used by the deploy script.

The docker group is root-equivalent on the host.

## Publish

Publish first. `deploy.sh` never builds images.

```sh
./bump-and-push-docker-image.sh             # bump, commit, tag, build, push
./bump-and-push-docker-image.sh --no-bump   # publish the current version
```

The script builds `linux/amd64` and pushes two tags:

- `abtzco/bookkeepr:latest`
- `abtzco/bookkeepr:<version>`

Production deploys use the version tag. See [commands.md](commands.md) for the script requirements.

## Deploy

`deploy.sh` is a local helper. It is listed in `.gitignore` and `.dockerignore`, so it is not in the repository or the image.

```sh
./deploy.sh <version>
./deploy.sh 2.0.0
```

The version must match a published tag. The script defaults to `abtz@139.162.111.88` and `~/.ssh/linode_rsa`; override with `SSH_TARGET` and `SSH_KEY`.

Sequence:

1. Check that the remote user can run docker.
2. Pull `abtzco/bookkeepr:<version>`.
3. Tag the image of the running container as `abtzco/bookkeepr:previous`.
4. Stop `bookkeepr`.
5. Copy `data/bookkeepr.db` to `data/bookkeepr.db.bak-YYYYmmddHHMMSS`. Keep the last 5 backups.
6. Remove the old container and start the new image on `127.0.0.1:8083`.
7. Poll `/api/settings` for up to 20 seconds.
8. On failure, start `:previous` again and exit 1.

Downtime is the stop, backup, and start interval (seconds).

The script does not touch nginx, TLS, or the HestiaCP site directory.

## First deploy on a new server

1. Create the HestiaCP site and issue a TLS certificate.
2. Set the nginx proxy template to the Docker template (`DOCKER PORT 8083`). The vhosts must proxy to `http://127.0.0.1:8083`.
3. Add the deploy user to the docker group.
4. Create the data directory as `abtz`:

```sh
mkdir -p /home/abtz/web/bookkeepr.abtz.co/data
```

5. Publish a version and run `./deploy.sh <version>`.

If the data directory does not exist, Docker creates it as root at run time and `abtz` cannot write backups.

The HestiaCP vhosts serve listed static extensions (`.css`, `.js`, `.html`, and others) from `public_html` first, then fall back to the container. Keep `public_html` empty or intentional. The old `index.html` ("Coming Soon") still answers `/index.html`; remove it if the app must own that path.

## Verify

```sh
# On the server
curl -fsS http://127.0.0.1:8083/api/settings
docker ps --filter name=bookkeepr
docker logs --tail 100 bookkeepr
```

Check the port binding. It must be `127.0.0.1:8083->8083/tcp`, never `0.0.0.0:8083->8083/tcp`.

```sh
# From anywhere
curl -fsS -o /dev/null -w "%{http_code}\n" https://bookkeepr.abtz.co/
```

## Rollback

Automatic: a failed health check restarts `abtzco/bookkeepr:previous`.

Manual: deploy an older published version.

```sh
./deploy.sh 1.3.1
```

The current image becomes `:previous`, so the failed version can be restored the same way.

The database backup does not roll back automatically. The app runs SQLite migrations at boot. If a bad release migrated the schema, restore the backup before starting the old image:

```sh
docker stop bookkeepr
cp data/bookkeepr.db.bak-YYYYmmddHHMMSS data/bookkeepr.db
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `permission denied ... /var/run/docker.sock` | User not in the docker group | `usermod -aG docker abtz`, then reconnect |
| `manifest unknown` on pull | Version tag was never published | Run `./bump-and-push-docker-image.sh`, check the tag on Docker Hub |
| Health check fails | App crash, migration error, port conflict | `docker logs --tail 100 bookkeepr` |
| `port is already allocated` | Old container still running | `docker rm -f bookkeepr`, then rerun |
| `/index.html` shows "Coming Soon" | `public_html/index.html` shadows the app | Remove the stale file |
| `http://139.162.111.88:8083` answers | Container published on `0.0.0.0` | Recreate with `127.0.0.1:8083:8083` |

## Notes

- Bare Deploy is not used. It is host-native (`type` accepts only `node` or `php`) and its rollback re-points a symlink without restarting a container.
- The container image is built for `linux/amd64`, which matches the server.
- The SQLite files live outside the container, so image changes do not touch them.

## Related

- [Commands](commands.md) — build, test, publish
- [Environment Notes](env-notes.md) — environment variables and Docker constraints
- [Architecture](architecture.md) — app structure and packaging
