# Environment Notes

- Node versions are managed via Volta (check `package.json` volta field)
- If SQLite/node-gyp issues occur, downgrade sqlite to `^5.0.0` and run `npm install -g node-gyp`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:8083` | Comma-separated list of allowed CORS origins. In production, set this to a single domain (no trailing comma). Local dev does not rely on this because the Vite proxy handles same-origin routing. |