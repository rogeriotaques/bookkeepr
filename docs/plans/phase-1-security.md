# Phase 1: Security Fixes

**Status: DONE**

## Context

The codebase has critical and high severity security issues that must be addressed before the app handles financial data. Single-user model is by design, SQLite is acceptable, KV store can be ignored.

## Files to Modify

### 1. `backend/controllers/entries.js` — SQL Injection (Critical)

**Problem:** Line 10 uses `whereRaw` with template string interpolation:
```js
.whereRaw(global.knex.raw(`strftime('%Y', entries.date) = '${year}' AND strftime('%m', entries.date) = '${month}'`))
```

**Fix:** Use Knex's parameterized binding. SQLite's strftime takes (format, date) so format must be bound:
```js
.whereRaw('strftime(?, entries.date) = ? AND strftime(?, entries.date) = ?', ['%Y', year, '%m', month])
```

---

### 2. `backend/middleware/basicAuth.js` — Broken `safeCompare` (Critical)

**Problem:** Lines 84-91 fill buffers with zeros before comparing:
```js
const aBuffer = Buffer.alloc(aLength, 0, 'utf8');
const bBuffer = Buffer.alloc(bLength, 0, 'utf8');
return !!(aLength === bLength && timingSafeEqual(aBuffer, bBuffer));
```

This compares two zero-filled buffers, meaning **any two strings of the same length will match**. Authentication is effectively bypassed.

**Fix:**
```js
const safeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};
```

---

### 3. `backend/controllers/auth.js` — Unsalted SHA-256 (High)

**Problem:** Uses `crypto.createHash('sha256')` with no salt.

**Fix:** Use PBKDF2 with random salt. Store as `salt:hash` format.

New password storage format: `${salt}:${hash}` (base64 encoded)

```js
const salt = crypto.randomBytes(16).toString('base64');
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('base64');
```

**Migration:** Verify by trying PBKDF2 first, then fall back to old SHA-256. On successful old-format verification, **re-hash and store in new format immediately**:
```js
const verifyPassword = (password, stored) => {
  if (stored.includes(':')) {
    // New format: salt:hash
    const [salt, hash] = stored.split(':');
    const computed = crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), 100000, 64, 'sha512').toString('base64');
    return timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
  }
  // Old SHA-256 format — verify then migrate
  const oldHash = crypto.createHash('sha256').update(password).digest('hex');
  const valid = timingSafeEqual(Buffer.from(stored), Buffer.from(oldHash));
  if (valid) {
    // Re-hash with PBKDF2 and update DB asynchronously
    migratePassword(password);
  }
  return valid;
};
```

Update `basicAuth.js:138-140` to use the same verify function.

---

### 4. `backend/main.js` — Wildcard CORS (Critical)

**Problem:**
```js
app.use(cors({ origin: true, credentials: true }));
```

**Fix:** Default to localhost dev origins, allow override via env:
```js
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8083').split(',');

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

In production Docker, set `CORS_ORIGIN=https://yourdomain.com` (single origin, no comma).

---

### 5. `backend/routes/settings.js` — Settings GET Must Remain Public (Intentional)

**Decision:** `GET /settings` is intentionally public.

**Rationale:** The frontend uses this endpoint to read `usePasswd` (boolean) and decide whether to show the login form. Making it authenticated creates a chicken-and-egg problem — the client can't know if auth is required without already being authenticated.

**Current protection:** The controller already filters out sensitive keys (`passwd` is on `KEY_BLACK_LIST`), so the password hash is never exposed. Only `usePasswd`, `dbFileSize`, and user-defined config values are returned.

**Action:** Keep `GET /settings` unauthenticated. Ensure `POST /settings`, `POST /settings/vacuum`, and mutating routes remain protected.

---

### 6. `backend/routes/auth.js` — Brute Force Protection (High)

**Problem:** No rate limiting on `/api/auth` endpoints. An attacker can attempt unlimited password guesses.

**Fix:** Add `express-rate-limit` to auth routes:
```js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later' }
});

router.post('/login', authLimiter, ...);
```

---

### 7. `backend/main.js` — Helmet CSP Review (Medium)

**Problem:** `contentSecurityPolicy` is disabled without explanation.

**Fix:** Re-enable Helmet's default CSP or define a minimal policy that allows the frontend's inline scripts. Document why if it must stay disabled.

---

## Verification

1. Run backend: `(cd backend; yarn start)`
2. Test SQL injection manually: `curl "http://localhost:8083/api/entries?year=2024'UNION..."`
3. Verify CORS blocks cross-origin requests from unauthorized domains
4. Verify safeCompare correctly rejects wrong passwords
5. Verify PBKDF2 hash is stored and verified correctly
6. Verify old SHA-256 passwords still work and are migrated to new format on first successful login
7. Verify rate limiting blocks repeated auth attempts

## Tests to Add

- Unit test for `safeCompare` (equal, different length, different content)
- Unit test for `verifyPassword` (PBKDF2 format, SHA-256 fallback, migration trigger)
- Integration test for CORS rejection
- Integration test for SQL injection attempt returning 400, not 500
- Integration test for rate limiting after N failed logins
