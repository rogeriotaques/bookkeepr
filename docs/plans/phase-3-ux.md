# Phase 3: UX Improvements

**Status: DONE**

## Context

Improve user experience by fixing auth state management, session persistence, and error visibility.

## Files to Modify

### 1. `frontend/src/composable/useState.ts` — Fix Auth State

**Problem:**
- `isAuthenticated` is never set to `true` after login
- State is not persisted — refresh loses auth
- No logout mechanism

**Fix:**
```ts
const state = reactive<State>({
  credential: sessionStorage.getItem('credential'),
});

const isAuthenticated = computed(() => !!state.credential);

const logout = () => {
  state.credential = null;
  sessionStorage.removeItem('credential');
};
```

> **Decision needed:** `sessionStorage` clears on tab close. If users expect auth to persist across browser restarts, switch to `localStorage` and document the security trade-off.

---

### 2. `frontend/src/pages/AuthPage.vue` — Fix Login Handler

**Problem:** Line 81 sets `state.credential` but doesn't persist it.

**Fix:** Save to sessionStorage on login:
```ts
state.credential = btoa(`user:${password.value}`);
sessionStorage.setItem('credential', state.credential);
```

---

### 3. `frontend/src/composable/useDataFetch.ts` — Remove Fallback Credential

**Problem:** Uses `btoa('user:empty-password')` as fallback when credential is null, masking auth failures.

**Fix:** Don't send auth header if not authenticated:
```ts
const Authorization = state.credential ? `Basic ${state.credential}` : '';
```

---

### 4. `frontend/src/domain/network/index.ts` — Handle 401 Gracefully

**Problem:** No handling for 401 responses to trigger re-auth.

**Fix:** Use an event-based approach to avoid layer violation:

1. Create `composable/useAuthEvents.ts`:
```ts
const authEvents = mitt();
export const useAuthEvents = () => authEvents;
```

2. In `useState.ts`, emit `logout` event when logging out.

3. In `errorHandler`, subscribe to `authEvents` and call `logout()` on 401:
```ts
authEvents.on('logout', () => {
  state.credential = null;
  sessionStorage.removeItem('credential');
  router.push('/auth');
});
```

This decouples network layer from state management.

---

### 5. `frontend/` — Add User-Facing Error Messages

**Problem:** Network and API errors fail silently or only log to console. Users see stale data or blank screens with no indication something went wrong.

**Fix:** Introduce a global error state or toast notification system. At minimum:
- In `useDataFetch.ts`, expose an `error` ref
- In pages using data (Entries, Reports, Wallets), display the error message when `error` is present
- On 401, redirect to login (handled in item 4)
- On 5xx, show a generic "Something went wrong, please try again" message

---

### 6. `frontend/` — Add Loading States

**Problem:** No loading indicators during data fetches. Users may think the app is frozen.

**Fix:** Expose an `isLoading` ref from `useDataFetch.ts` and bind it to skeleton placeholders or spinners on:
- Entries list
- Reports charts
- Wallets / Groups tables

---

## Verification

1. Login, refresh page — should remain authenticated
2. Logout — credential cleared, redirected to login
3. Make API call without auth — should get 401, not fake success
4. Check browser console for any auth-related errors
5. Disconnect backend, load a page — user should see an error message, not a blank screen
6. Navigate between pages — loading state should be visible during fetches

## Tests to Add

- Unit test for `useState.ts` (login, logout, persistence)
- Unit test for `useDataFetch.ts` (no auth header when unauthenticated, 401 triggers event)
- Component test for `AuthPage.vue` (form submission, error display)
