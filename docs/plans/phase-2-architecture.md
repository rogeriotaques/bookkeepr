# Phase 2: Architecture & Code Quality

**Status: DONE**

## Context

After securing the app, improve the codebase maintainability by adding structure and fixing code quality issues.

## Files to Modify

### 1. `backend/controllers/reports.js` — Implicit Globals (Medium)

**Problem:** Lines 64, 65, 77 use undeclared `income`, `i`, `outcome` in for-of loops.

**Fix:**
```js
for (const income of data.income) {
  for (let i = 1; i < income.length; i++) {
```

---

### 2. `backend/main.js` — Missing `await` on `createDatabase` (High)

**Problem:** `createDatabase()` is called without `await` inside the try block (line 87). If database initialization fails, the error is an unhandled promise rejection instead of being caught.

**Fix:**
```js
await createDatabase();
```

---

### 3. `backend/main.js` — Add Error Handling Middleware

**Problem:** No centralized error handling. Promise rejections bubble up uncaught.

**Fix:**
```js
app.use((err, req, res, next) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[Error]', req.method, req.path, message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});
```

Also add a 404 handler:
```js
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});
```

---

### 4. `backend/lib/db.js` — Add Transaction Helper

**Problem:** No transaction support for multi-step operations.

**Fix:**
```js
// backend/lib/db.js
const withTransaction = async (fn) => {
  return global.knex.transaction(fn);
};

module.exports = { withTransaction };
```

Use in controllers when doing multi-table operations (e.g., `auth.js` delete + insert).

---

### 5. `backend/` — Standardize Response Shapes

**Problem:** Success responses are inconsistent — some return `{ success: true, ... }`, others return bare arrays/objects with no `success` flag.

**Standard format (flat):**
```js
// Success
res.json({ success: true, entries: [...] });

// Error
res.status(4xx).json({ success: false, message: '...' });
```

**Audit and fix per controller:**

| Controller | Current | Target |
|---|---|---|
| `entries.js` | `res.json({ entries })` | `res.json({ success: true, entries })` |
| `entries.js` | `res.json({ years })` | `res.json({ success: true, years })` |
| `entries.js` | `res.json({ entry })` | `res.json({ success: true, entry })` |
| `wallets.js` | `res.json({ wallets })` | `res.json({ success: true, wallets })` |
| `wallets.js` | `res.json({ wallet })` | `res.json({ success: true, wallet })` |
| `groups.js` | `res.json({ groups })` | `res.json({ success: true, groups })` |
| `groups.js` | `res.json({ group })` | `res.json({ success: true, group })` |
| `reports.js` | `res.json({ year, data, insights })` | `res.json({ success: true, year, data, insights })` |
| `settings.js` | `res.json({ config })` | `res.json({ success: true, config })` |
| `auth.js` | `res.json({ isAuthenticated })` | `res.json({ success: true, isAuthenticated })` |

**Impact:** Frontend composables (`useDataFetch.ts`, etc.) should be checked to ensure they don't break if they were expecting bare arrays.

---

### 6. `backend/main.js` — Add Request Logging

**Problem:** No visibility into incoming requests or errors in production.

**Fix:** Add `morgan` or a minimal custom logger:
```js
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

---

### 7. `backend/` — Add Input Validation Layer

**Problem:** Validation is ad-hoc and duplicated across controllers (e.g., checking `name.length > 50` in multiple places).

**Fix:** Introduce a lightweight validation helper or middleware. Example:
```js
const validate = (rules) => (req, res, next) => { ... };
```
Start with `entries.js`, `wallets.js`, and `groups.js` since they share common patterns (required fields, max length checks).

---

### 8. `frontend/src/vite-env.d.ts` — Fix TS Config

**Problem:** `@ts-expect-error` used for `import.meta.env.MODE` due to missing type definitions.

**Fix:** Ensure `vite-env.d.ts` has:
```ts
/// <reference types="vite/client" />
```

This is likely already present but may be incorrectly referenced.

---

## Verification

1. Run `(cd frontend; yarn build)` to ensure no type errors
2. Run backend and trigger an error — check it logs properly and returns `{ success: false }`
3. Hit a non-existent API route — verify 404 returns `{ success: false, message: 'Not found' }`
4. Verify transaction helper works for multi-table operations
5. Verify all success responses include `success: true`

## Tests to Add

- Unit tests for the validation helper
- Integration tests for 404 and 500 error handlers
- Integration tests verifying consistent response shapes for all endpoints
