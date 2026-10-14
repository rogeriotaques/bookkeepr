# BookKeepr — Memory

## Facts

- Monorepo: `frontend` (Vue 3 + Vite + TS, hash router), `backend` (Express + Knex + SQLite3).
- App version `2.0.0` (root) / `1.3.1` (frontend & backend packages).
- Auth: password-based (PBKDF2), `config.passwd`; no magic link.
- CSS: vendored `frontend/src/styles/boring_2.0.0.css` (boring-css v2.0.0), imported by `bookkeepr.scss`. Simple Grid is gone (v2 has built-in CSS Grid).
- Design tokens: `frontend/src/styles/tokens.scss` (`--bk-*`).
- Test runners: Vitest. Frontend `npm test` (57 tests), backend `npm test` (36 tests).

## Session 2026-10-10 — Boring CSS v2 upgrade

- Replaced `boring_1.0.0.css` + `boring_simple-grid.css` with `boring_2.0.0.css` (upstream v2.0.1).
- Updated `bookkeepr.scss` import and `docs/plans/phase-4-redesign.md` version note.
- Verified: frontend build OK, 46/46 frontend tests, 36/36 backend tests.
- Light mode only is enforced: removed `prefers-color-scheme: dark` block from `tokens.scss`; set `color-scheme: light` in `bookkeepr.scss` (after boring import). v2's `[data-mode=dark]` rules are inert because `index.html` pins `data-mode="light"` and nothing toggles it.
- Browser-checked (terminal-browser, login `123`, local `data/bookkeepr.db`):
  - Grid OK: `col-3`/`col-9` and `col-6`/`col-6` sit side-by-side ≥768px; stack full-width below; no horizontal overflow at 375px.
  - Font OK: base is Archivo; code stays Source Code Pro.
  - Light OK: with simulated OS dark preference, `color-scheme: light`, body `rgb(245,245,245)`, black text.
- Layout tweaks: `.dashboard__content` top padding 32px (`var(--bk-space-xl)`); `SettingsNavigation` menu becomes a horizontal top bar below 768px (no sticky/overlap, transparent bg, no link underlines) and keeps the sticky boxed sidebar at ≥768px.
- Responsive tables: `.table-scroll` class on `GroupTable`, `WalletsTable`, `BalanceTable`. Base (mobile) `display:block; overflow-x:auto` + `thead{position:static}` (a sticky header overlaps the first row and cannot work in the scroll container); restored to `display:table` / `thead{position:sticky}` at ≥768px. Page no longer scrolls sideways at 425px.
- `PlanningPage` restyled to boring primitives: sections use `.box`, goal/month fields use `.input`, buttons are plain boring `button` (Done is `type="submit"`), `+` add buttons `is-auto-width`. Removed the soft rounded custom styling. The goal is not a `.box` (label + bordered textarea sit on the page); income/expenses sections are `.box`. NOTE: `IncomeCalculator`/`ExpensesCalculator` modals still use the old rounded custom styles (not yet aligned).

## Session 2026-10-14 — Transactions UI polish + date input

- Fixed Vite `@charset` warning: dropped the redundant `@charset` from `boring_2.0.0.css` (Sass emits `.css` imports as plain CSS, so the charset landed mid-file).
- `PlanningPage`: month dropdown moved onto the title row (label removed).
- `TransactionHistoryPage`: summary is now `.box`; empty-state `colspan=6`; filter dropdowns on one row; budget progress is Boring `.progress` determinate (light-blue budget track, red actual fill), full width; removed "Record new expense" link and bound Cmd/Ctrl+I → `/entry`.
- `TransactionEntryPage`/`EntryForm`: removed "View transaction history" link; Date moved before Amount; `.card`→`.box`.
- `BaseProgress`: honours `value`/`max` via `progress--N`; `progress--infinite` only when no `value` given.
- `BaseDropdown`: item hover no longer shifts or shows a bottom edge — added `:not(:disabled)` so the reset beats Boring's `button:hover` specificity.
- `useBudget`/`useMonthlyReport`: fixed double-unwrap (the axios interceptor already returns `resp.data`), which made queryFn return `undefined` and the summary always ¥0.
- New `DateInput.vue` (masked `YYYY/MM/DD`, autofocus on day, arrow/backspace/paste/segment editing, emits ISO) replaces the native `<input type="date">` in `EntryForm`; native date input can't focus the day segment (setSelectionRange throws, `lang` ignored). Tests: 50/50, build OK.
- Equal addon widths: Boring sets `min-width: 0` on `.input--with-addons > .input__addon` (specificity 0,2,0) and beat bookkeepr's `.input__addon { min-width: 54px }` (0,1,0); moved the rule to match specificity so Date/Amount addons are both 54px.
- Version bumped 1.3.1 → 2.0.0 in `frontend` + `backend` package.json (login footer via `__VERSION__`; dev server needs a restart to pick up the `define`). `EntryForm` actions got `margin-top: var(--bk-space-xl)` to space the Save button from the form.
- `DashboardPage` aligned to Boring: summary is one `.box` with a 3-col grid (Budget/Actual/Balance, negative balance red), progress is a `.box` whose bar matches History (full width, light-blue budget track, red actual fill, default 36px), and quick actions are `.button.is-full-width`.
- Dashboard actions: "Record new expense" uses a green `--primary` modifier (copies `button[type=submit]`), a red `--danger` Logout button was added (calls `logout()` from `useState`, returns to auth), and the last action gets an extra 16px top gap (24px total) to separate it.
- `BalanceTable`: all cells `white-space: nowrap` except `td.balance-table__description` (wraps, `min-width: 200px`). Tests: 51/51.
- `BalanceFilterForm`: below 768px the search and the filters stack into separate rows (dropdowns split the filter row); single row at ≥768px.
- `BaseModal` footer Cancel is now a real Boring `<button>` (was an underlined link); footer buttons share the row (`flex: 1 1 0`). NOTE: `BaseConfirmModal` still uses `card__link` anchors for Cancel/Confirm.
- `GroupForm` Expense Type was a bare `<select class="input">` (no Boring field styling); wrapped it in `<div class="input">` like the other fields / `PlanningPage` month select.
- Gotcha: the Electron terminal-browser runs Chromium 150, where `appearance: none` on `<select>` computes to `base-select` (ignored), so Boring selects show an extra native indicator there. It affects the existing Planning select equally; not a code issue.

## Session 2026-10-14 — Planning: reactive month + auto-save

- `useBudget(year, month)` takes `MaybeRefOrGetter<number>`, keys the query with `computed(() => [BUDGET_KEY, toValue(year), toValue(month)])`, and returns `{year, month, budget, items}` as `queryData`. Before, `PlanningPage` passed `selectedMonth.value` (captured once), so changing month never changed the query key. Existing callers pass plain numbers and still work.
- `PlanningPage` no longer has `Cancel`/`Done`; it auto-saves. Goal debounces 600 ms (flush on blur/month-change/unmount); calculator `update` saves immediately. Saves are serialized (one in flight, latest snapshot queued); first save creates the budget, later saves update. Only errors toast.
- Locals sync when data for the selected month arrives, guarded by a `dirty` flag (unsaved local edits). `useSaveBudget` writes saved data back with `setQueryData` (no refetch) so the cache is never stale.
- Bug found in the browser: returning to a month showed an empty goal and the next save 400'd ("Budget already exists"). Cause: Vue Query served the **stale cached** value (e.g. `null` from before the create); the watcher applied it, then the fresh refetch for the **same key** was skipped by a key-only guard, leaving `budgetId` null. Fix: `setQueryData` on save + re-apply same-key data when not dirty. Covered by `PlanningPage.integration.test.ts`.
- Tests: `useBudget.test.ts` (reactive refetch) + `PlanningPage.test.ts` (9 unit cases) + `PlanningPage.integration.test.ts` (return-to-month, edited goal → update not create). 57/57 frontend. Plan: `docs/plans/2026-10-14-planning-autosave.md`.

## Phase 4 status (WIP)

- Done: 4.1 schema + budget tables; 4.2 budget/reports/groups endpoints; 4.3 routes + bottom-tab layout + tokens; 4.4 Dashboard; 4.5 Planning + calculators; 4.6 entry/history split; 4.7 groups `expense_type`; most 4.8 shared-component bug fixes.
- Open: `PRAGMA foreign_keys = ON` missing in production `backend/main.js` (only in `tests/utils.js`); no `entries.group` ON DELETE rule; dead/unrouted files `pages/NewEntryPage.vue`, `pages/ReportPage.vue`, `components/report/*`, `components/navigation/AppNavBar.vue`; 4.9 responsive/a11y/QA not verified; `docs/plans/phase-4-redesign.md` has no `status` field and is not linked from root `AGENTS.md`.
