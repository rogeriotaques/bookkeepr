# BookKeepr — Memory

## Facts

- Monorepo: `frontend` (Vue 3 + Vite + TS, hash router), `backend` (Express + Knex + SQLite3).
- App version `2.0.0` (root) / `1.3.1` (frontend & backend packages).
- Auth: password-based (PBKDF2), `config.passwd`; no magic link.
- CSS: vendored `frontend/src/styles/boring_2.0.0.css` (boring-css v2.0.0), imported by `bookkeepr.scss`. Simple Grid is gone (v2 has built-in CSS Grid).
- Design tokens: `frontend/src/styles/tokens.scss` (`--bk-*`).
- Test runners: Vitest. Frontend `npm test` (63 tests), backend `npm test` (36 tests).

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
- Gotcha: `IncomeCalculator`/`ExpensesCalculator` do not use the current `BaseModal` API. `BaseModal` uses `defineModel()` for `isOpen` and emits `cancel`/`confirm`; the calculators passed no `v-model` and used `@close`, so `isOpen` was undefined and the `+` buttons opened nothing. Fixed both to `v-model="isOpen"` (local ref, starts true) + `confirm-text="Done"`/`@confirm`/`@cancel`, dropping their custom footer. `PlanningPage` tests stub these components, so only `PlanningCalculators.test.ts` (mounts real `BaseModal`, asserts teleported modal text) catches it. 59/59 frontend.
- Restyled both calculators to Boring primitives (replacing the old rounded custom look): total is a nested `.box`; each item is a flex row grouping its fields + an auto-width red delete button (`--c-danger` text/border, `--c-danger-background`); add is `.is-full-width` with a `--bk-space-lg` top gap matching the total gap; amount uses `.input--with-addons` with a `¥` `.input__addon`. Boring's `.input > [type=number]` hides the native spinners. Verified via terminal-browser screenshots.
- Known cramped spot: at narrow widths the Expenses row packs type + category + amount(+addon) + delete into one flex line, so "Select category" wraps and its caret overlaps. Not yet fixed.
- Calculator UX tweaks: delete buttons are `tabindex="-1"` (Tab skips them → next row's first field, then `+ Add`); `+ Add` focuses the new row's first field via a `v-for` template-ref array; amount uses the `v-money` directive (masked, `V_MONEY_OPTIONS`). NOTE: the `v-money` *directive* (v0.8.1, Vue 2-era; the bundled `<money>` component is not usable with Vue 3 `v-model`) makes the model a formatted **string** ("1,000"), so `BudgetItem.amount` is edited as `number | string` and normalized with new `parseAmount`/`formatAmount` helpers in `domain/utils.ts` before totals/emit. Tests register `VMoney` via `global.plugins`.
- Bug: the expense calculator listed no categories. `ExpensesCalculator` called raw `http.get('/groups?active=1')`, which sends **no** `Authorization` header (only the named network helpers pass `headers.value`), so it 401'd (and emits `unauthorized` → logout) and read the wrong shape (`res.data.groups`; `http` already unwraps to the body). Added `fetchGroups()` to `domain/network` (with auth headers) and used `res.groups`. Test asserts only `outcome` groups are listed.

## Phase 4 status (WIP)

- Done: 4.1 schema + budget tables; 4.2 budget/reports/groups endpoints; 4.3 routes + bottom-tab layout + tokens; 4.4 Dashboard; 4.5 Planning + calculators; 4.6 entry/history split; 4.7 groups `expense_type`; most 4.8 shared-component bug fixes.
- Open: `PRAGMA foreign_keys = ON` missing in production `backend/main.js` (only in `tests/utils.js`); no `entries.group` ON DELETE rule; dead/unrouted files `pages/NewEntryPage.vue`, `pages/ReportPage.vue`, `components/report/*`, `components/navigation/AppNavBar.vue`; 4.9 responsive/a11y/QA not verified; `docs/plans/phase-4-redesign.md` has no `status` field and is not linked from root `AGENTS.md`.

## Session 2026-10-15 — Desktop UX pass

- New `--bk-max-width-wide: 1180px` (tokens.scss). Dashboard, History, Entry and Planning use it; Auth and lone forms keep `--bk-max-width`.
- `Dashboard.vue`: at ≥1024px the tab bar becomes a sticky **top** bar (5 tabs + right-aligned Logout); the fixed bottom bar stays below 1024px. Gotcha: `bookkeepr.scss` has `button, .button { display: flex !important }`, which beats a plain `display: none` — every breakpoint toggle of a button's display needs `!important`.
- `DashboardPage`: dropped the 5 quick-action buttons (the nav owns History/Planning/Settings). Header keeps "Record new expense" (primary) + Logout. ≥1024px: 2-col grid — summary + progress + annual chart | recent transactions.
- New `components/report/AnnualChart.vue` (chart.js `Bar`, `/reports?year=`: balance line + income bars + negative outcome bars) and `components/transactions/RecentTransactions.vue` (current-month entries, newest first, `limit` prop). Both self-fetch with `useDataFetch` + top-level await (needs Suspense, same as `EntryForm`).
- `TransactionHistoryPage` widened; `TransactionEntryPage` 2-col (form | recent); `PlanningPage` 2-col (goal | totals). Page `h1` → `--bk-text-3xl` at ≥1024px.
- Gotcha: `vue-chartjs` `Bar` has no `name`, so VTU cannot stub it by key (`stubs: { Bar: true }` is a no-op and chart.js then fails on the jsdom canvas). Mock the `vue-chartjs` module instead.
- `/report` stays unrouted (`router.test.ts` asserts it); the chart lives on the Dashboard.
- Tests 63 → 74, all green. Build OK. Browser check blocked: `terminal-browser` cannot resolve the ghostty pane from the agent shell and no browser MCP is configured.

## Session 2026-10-15 — Desktop UX feedback round 2

- **Browser checks are possible after all:** `terminal-browser` cannot find the ghostty pane from the agent shell, but headless Chrome over CDP works. Launch `Google Chrome --headless=new --remote-debugging-port`, seed `sessionStorage.setItem('credential','dXNlcjoxMjM=')`, `Page.reload`, then `Page.captureScreenshot`. Chrome is at `/Applications/Google Chrome.app`. `usePasswd` is true, so the seed step is required.
- Fixed the nav overlap: the base rule is `position: fixed` and the desktop media query never set `position`. Now `position: sticky`.
- Nav tabs looked like boxed widgets because Boring styles every bare anchor (`a:not(.button):not(.card__link)`, 0,2,1). Styled from `.dashboard__nav .dashboard__tab` (0,3,0) to win without `!important`.
- Added a `display: none`/`flex` font-size 10px + 4px padding for the mobile tab so 6 tabs fit 375px; `overflow-x: auto` on the bar is a safety net.
- `--bk-danger-light: color-mix(in srgb, var(--bk-danger) 55%, white)` is the progress fill on Dashboard + History.
- Chart.js left legends clip their labels because the text is measured before the Archivo webfont loads. Pinning `legend.labels.font.family = 'Archivo, sans-serif'` (+ size 11, boxWidth 12) fixes it. Applied in `AnnualChart` and `ReportPage`.
- `/report` restored (route + 6th nav tab). Two dormant bugs surfaced: `ReportPage`'s scoped `&__insights { display: flex }` beat Boring's `.row` grid so the insight cards collapsed, and the chart had no height so it rendered blank.
- The Dashboard annual chart is `display: none` below 1024px — a 21-item left legend does not fit a phone. The Report page has the full chart.
- Tests 74 → 75, all green. Build OK. Visually verified at 375px and 1440px: Dashboard, Entry, History, Planning, Report.

## Session 2026-10-15 — Logout prominence

- The desktop nav Logout is now a quiet grey text action (transparent, no border, no shadow); it turns `--bk-danger` on hover/focus/active. The mobile page Logout became a neutral outline button instead of a red-filled one, so the action looks the same on both.
- Specificity gotcha (same family as the `display: none` one): Boring's `button:not(:disabled):not(.button--disabled):hover` is **(0,3,1)**, not (0,2,1) — `:hover` counts too. A scoped `&__logout:hover` is only (0,3,0) and loses. Add the ancestor (`.dashboard__nav .dashboard__logout`) or `.dashboard-page .dashboard-page__logout` to reach (0,4,0).
- Screenshot tip: `Page.captureScreenshot` with `captureBeyondViewport: true` re-renders and **drops the hover state**, so verify hover with `Runtime.evaluate(getComputedStyle(...).color)` after `Input.dispatchMouseEvent`, not from the image.

## Session 2026-10-15 — Nav alignment

- The bar now shares the page grid: a `__nav-inner` wrapper with `max-width: var(--bk-max-width-wide)` and the same 16px gutter, `justify-content: flex-start` on desktop. The first tab starts exactly on the `h1` (`tabLeft === h1Left === 146` at 1440px) and Logout ends on the content's right edge.
- Gotcha: for an absolutely positioned element, `right` measures from the **margin box**, so Boring's `button { margin: 0 4px 8px 0 }` shifted the Logout 4px short of the content edge. `margin: 0` fixes it.
- Logout hover is now a `--bk-danger-light` pill with `--bk-danger` text (confirmed via computed style: `rgb(165, 43, 43)` on `rgb(205, 138, 138)`).

## Session 2026-10-15 — Dashboard layout swap

- `DashboardPage` columns swapped: the annual chart is the left column (2fr) and the summary + spending progress + recent transactions stack in the right column (1fr). At 1440px that measured chart `x=146 w=745`, side `x=919 w=375`.
- The 3-up summary still fits the 375px right column; the chart legend still fits 745px. Below 1024px the grid is `display: block` (single column) and the chart stays `display: none` — a 21-item left legend does not fit a phone, so the full chart lives on the Report page.
- `RecentTransactions` moved inside the side column but outside the `isLoading` branch, so it renders with its own skeleton while the budget/report queries settle.

## Session 2026-10-15 — Entry + History merged into Transactions

- Routes `/entry` and `/history` are gone; both are now `redirect: '/transactions'` so old hash bookmarks still work. Nav is 5 tabs (Dashboard, Transactions, Planning, Report, Settings); the merged tab uses `IconReceipt`.
- `TransactionEntryPage` is the merged page: `EntryForm` (380px) left, `TransactionHistoryPage` (1fr) right at ≥1024px; single column (form first) below.
- `TransactionHistoryPage` lost its page chrome (gutter/max-width/`h1`) and its `Cmd+I → /entry` shortcut. **Watch out:** it used to fight `EntryForm`'s `Cmd+I` (focus the amount field) — two `keydown` listeners on `document` for the same chord. Any future page that hosts both must not re-add it.
- The balance table survives the narrower column: `white-space: nowrap` keeps amounts on one line and the description column (`white-space: normal`, `min-width: 200px`) takes all the wrapping. Verified by injecting rows with `¥ 1,234,567` and 3-line descriptions into the live DOM in headless Chrome — the table stayed at 744px and `document.scrollWidth` never left the viewport, so no `overflow-x` workaround is needed.
- Handy trick: to test wide data without writing to the DB, `insertAdjacentHTML` fake `<tr>`s into the live table and re-measure.
- Tests 75 → 71 (four tests about the retired pages/tabs removed). Build OK.

## Session 2026-10-15 — Dashboard annual budget summary

- `DashboardPage` no longer uses `useBudget`/`useMonthlyReport`. It fetches `/reports?year=` and derives **annual budget = Σ `budgets[].budget`** and **annual actual = `insights.thisYear.outcome`**. No backend change was needed: the annual report already carries both.
- **`useDataFetch` caches by value, not by ref:** the key is `['fetch', url]` and vue-query unwraps the ref, so two components fetching `/reports?year=2026` share one cache entry and issue **one** request. Verified with CDP `Network.requestWillBeSent` (1 call with both the page and `AnnualChart` mounted). The earlier worry about a duplicated `/reports` fetch was unfounded.
- `DashboardPage` now has a top-level `await`, so it needs the `<Suspense>` that `App.vue` already wraps `<RouterView>` in. Its test must mount through a `Suspense` helper (same as `EntryForm`/`AnnualChart`).
- Testing trick worth reusing: when the real data cannot distinguish two behaviours (here the annual sum equals the only month that has a budget), intercept the API and serve crafted data. `Fetch.enable({ patterns: [{ urlPattern: '*/api/reports*' }] })` + `Fetch.fulfillRequest` with a base64 `body` — no DB writes, and it proves the whole path.
- Tests 71 → 72. Build OK. Verified at 1440px and 375px.

## Session 2026-10-15 — Transactions summary follows the filter

- Bug: the summary bar on `/transactions` was pinned to the mount month. Cause: `useBudget(Number(year.value), Number(month.value))` — reading a ref with `Number()` during setup snapshots the value. The table was fine because its URL is a `computed`.
- **Rule of thumb:** reactiveness must come from a `computed`/getter, never from `someRef.value`. Two ways to spot it: a `.value` inside a composable argument, or a composable whose parameters are plain `number`/`string` (as `useMonthlyReport` was).
- `useMonthlyReport` now mirrors `useBudget`: `MaybeRefOrGetter<number>` + `toValue` in both the `queryKey` (`computed`) and the `queryFn`. With a reactive key vue-query refetches on its own; the `watch([year, month])` only needs to invalidate the entries/recorded-years queries.
- Test recipe for "does this follow the filter?": capture the composable's arguments in the mock, emit `update:month` from the filter stub, then `toValue(capturedArg)`. A snapshot returns the old number and fails.
- Verified by driving the real dropdown in headless Chrome (`trigger.click()` then the `.base-dropdown__item` with the wanted label — plain DOM `.click()`, no mouse events needed). October ¥1,700/¥1,000/59% → May ¥0/¥0/0%, with a fresh `month=5` request.
- Tests 72 → 74 (19 files). Build OK.

## Session 2026-10-16 — Dashboard: planned vs realized

- Backend annual report now carries **`planned`** and **`realized`**, each `{ income, expense }`. `planned` is a single grouped query over `budget_items` joined to the year's `monthly_budgets`; `realized` is copied from `insights.thisYear` (income/outcome). The per-month `budgets[]` array (expense-only `budget`/`actual`) is untouched for back-compat.
- `DashboardPage` card is now a **table** (rows Income / Expenses / Balance × columns Planned / Realized) and the progress `box` holds **two bars** (Income green `--bk-primary`, Expenses red `--bk-danger-light`), each `realized / planned`.
- Removed the derived `annualBudgetTotal`/`annualActualTotal`/`balance`/`progressPercent`; the empty-budget state keys off `planned`, and the no-transactions state off `realized`.
- CSS specificity note: the numeric cells carry a base `dashboard-page__summary-value` class; the `--negative` modifier (0,1,0) is declared **after** the base rule so it wins. A bare `.dashboard-page__summary-table td` rule (0,1,1) would have beaten it.
- Tests: backend 36 → 38, frontend 74 → 75. Build OK (SCSS compiles).

## Session 2026-10-16 — Transactions summary + stale cache fix

- **Bug**: saving an entry did not refresh the list or the report. `TransactionEntryPage.onSubmitHandler` called `addEntry` but never invalidated the vue-query cache. Fix: `useQueryClient()` + a predicate `invalidateQueries` that matches `monthly-report` and any `fetch` key whose url starts with `/entries` or `/reports` (skips settings/groups/wallets).
- **Gotcha (important)**: `useDataFetch`'s own `invalidateQuery` (`{ queryKey: ['fetch', ref] }`) is a **latent no-op** — vue-query `cloneDeepUnref`s the stored key to `['fetch', '<string>']`, so matching against a key that still holds the `Ref` object fails `partialDeepEqual`. Predicate/string keys are the reliable way to invalidate. Existing callers still "work" only because their URL is a computed that changes the key.
- Extracted `components/report/PlannedRealizedSummary.vue` (props `planned`/`realized` + optional `title`): the planned-vs-realized table + the two progress bars, now shared by `DashboardPage` and `TransactionHistoryPage`. The old per-page `__summary`/`__progress` SCSS is gone.
- Monthly report now carries `planned`/`realized` (`{ income, expense }`) like the annual one; `TransactionHistoryPage` dropped `useBudget` entirely (one request less) and derives both from `useMonthlyReport`.
- Layout: the shared component is a `grid` with `repeat(auto-fit, minmax(min(300px, 100%), 1fr))` — summary and progress sit side by side when the column is wide (Transactions ≈744px → 2 cols) and stack when narrow (Dashboard side ≈375px → 1 col). No media query needed; the grid is container-aware.
- Height alignment (follow-up): `align-items: stretch` plus a slimmer bar — `:deep(.progress){height:28px;margin-bottom:0}`, header `margin-bottom: 4px`, `justify-content: center` — brings the progress panel down to the summary panel's height (was ~35px taller: Boring bars are 36px + an 8px bottom margin each).
- Tests: backend 38 → 39, frontend 75 → 77 (`TransactionEntryPage` invalidation test + rewritten `TransactionHistoryPage` summary/progress tests). Build OK.

## Session 2026-10-18 — Dashboard layout per wireframe

- Split `PlannedRealizedSummary.vue` into `PlannedRealizedTable.vue` (card; props `planned`/`realized`/`title`) and `PlannedRealizedProgress.vue` (card; props `planned`/`realized`, keeps `data-testid="progress-bar"`); deleted the old bundled component. Each **page now owns the layout**, which is what the wireframe needed (table and progress live in different grid cells on the Dashboard).
- `DashboardPage`: explicit grid areas at ≥1024px — `grid-template-areas: 'header summary' 'chart side'`. Row 1 = greeting | annual budget card; row 2 = chart | progress + recent transactions. The header moved *inside* the grid and the budget card moved *out* of the side column. Because a grid row's height is the tallest cell, the chart now starts level with the progress panel (row 1 is as tall as the budget card).
- Spacing: `margin-bottom` is reset on `__header`/`__summary` at desktop and `:deep(.box){margin:0}` on the summary cell, so the grid `gap` is the only spacing.
- Mobile: `__grid` stays `display: block`; template order is greeting → budget card → chart (hidden) → progress + recent, i.e. unchanged from before.
- `TransactionHistoryPage` wraps the two components in `.history-page__summary` with the same auto-fit `minmax(min(300px,100%),1fr)` + `align-items: stretch`, so the side-by-side behaviour is preserved.
- Tests: frontend 77 → 80 (3 structural tests: grid child order, budget card in the summary cell not the side, progress + recent in the side). Build OK.

### Follow-ups (same session)

- Greeting is an **insight, not a title**: it opts out of the global Title Case with `text-transform: none`, and it is wrapped in its own `.box` like every other card.
- Insight alignment: desktop `&__header { align-self: stretch; align-items: stretch }` + `&__heading { display:flex; flex-direction:column; justify-content:center; flex:1; text-align:left }` → the insight card fills row 1 (same height as the annual budget card), text vertically centred and left-aligned. History: `align-items: center` wrongly centred the block horizontally; `flex-start` flush-left the bare text; wrapping in a `.box` replaces that with the card's own padding.
- Titles are Title Case app-wide: one rule in `bookkeepr.scss` — `h1,h2,h3,h4,h5,.title { text-transform: capitalize }`. Uses CSS only, so the source strings stay readable. `PlannedRealizedTable`'s `thead th` stays `uppercase` (column headers, not titles).



## Session 2026-10-20 — Print report review

- Bugs reported on `CMD+P`: charts each on a full page, mobile bottom nav printed, Pro Tip printed, portrait paper clipped the 13-column table.
- Root cause of the stacked charts: Boring's grid only assigns `grid-column` spans inside `@media screen (min-width: 768px)`. Print matches no breakpoint, so **every `.col-*` falls back to `span 12`**. Any printable layout must restate its spans under `@media print`.
- Chart.js sizes the canvas from the **screen** layout and keeps those pixels when printing (no resize on `beforeprint`), so a canvas can be wider than its printed column. Fix: `canvas { max-width: 100% !important; height: auto !important }` in print; the column then takes the scaled canvas height (`height: auto`).
- `@page { size: A4 landscape; margin: 10mm }` lives in `bookkeepr.scss` — the report is the only printable view. Same file resets `html/body/#app` to `height: auto` + white, otherwise the 100vh app clips the print to one sheet.
- Print overrides are declared **last** in `Dashboard.vue`: plain `@media (min-width: 1024px)` also matches landscape print (content width 1047px), so an earlier print block loses to the desktop rules.
- Chrome repeats only the **first** `thead` on every sheet. With three sections (expenses/income/footer) that labels the footer's rows "Expenses", so print sets `thead { display: table-row-group }`; each section already carries its own heading in the flow.
- The footer (Balance/Consumption tax) jumped to a third sheet because the repeated header + the 48px pre-footer padding did not fit. Trimmed to `--bk-space-sm` under `@media print`.
- Table fitted to landscape with `font-size: 12px`, `padding: 2px 6px` and a 170px `report__item-title`.
- Verified by Chrome headless `--print-to-pdf` + Ghostscript render: 2 A4-landscape sheets (charts | table), no nav, no tip, no clipping. Needs `--window-size=1440,900`; at the default 800px the pie legend prints tiny.
- Auth for that check: backed up `data/bookkeepr.db`, set `config.usePasswd=0`, then restored to 1. Frontend 99 tests pass.

### Follow-ups (same session)

- Title is `Annual Report for <YEAR>` (`filterByYear`). It sets `text-transform: none` so the global Title Case rule does not turn "for" into "For".
- The insights print above the charts. The row also holds the year dropdown + print button (`.report-page__controls`), so print hides the controls, widens the `col-10` to 12 and restates `col-3` in `ReportInsights.vue` — otherwise each box would take a full row.
- Frontend 100 tests (one new: the title carries the year).

### Follow-ups 2 (same session)

- Print gaps: title and insights each get `--bk-space-xl` (32px) below them.
- Chart wrappers are cards now: `padding: 16px` all round (was `16px 0`), `border-radius: var(--bk-radius-md)` to match the boxes. The canvas shrinks accordingly, so screen and print both look clothed.
- **Chart.js cannot be trusted at print time**: `--print-to-pdf` runs sometimes caught it mid-redraw, painting a pie centred on the canvas's left edge (only half the pie visible). CSS cannot recover pixels that were never drawn, and `max-width`/`object-fit` on the canvas do not help. Fix: `beforeprint` writes `canvas.toDataURL()` into an `img` that print shows over the canvas (`inset: 0`, `box-sizing: border-box`, `padding: 16px`, `object-fit: contain`, white background). The canvases are `visibility: hidden` in print when a snapshot exists (`:has`) — `display: none` would make Chart.js measure a zero-size container.
- Boring styles **every** `img:not(.icon)` with a 2px border, radius, shadow and margin; the snapshot img resets all four or it prints as a framed picture.
- Wrapper print height is fixed at 360px for both charts, `overflow: hidden` in case a stale canvas is taller.
- Verified with CDP + `Page.printToPDF` (dispatch `beforeprint` first, since CDP printing does not): 2 sheets, both charts whole, with and without `printBackground`. Frontend 101 tests (new: beforeprint fills both snapshots).

## Session 2026-10-21 — Docker build repaired after npm migration

- Docker was broken. The `Dockerfile` still ran `yarn policies set-version` + `yarn install`. Yarn 4 runs it at `/`, creates `/package.json`, then rejects `/bookkeepr/frontend` ("not part of the project declared in /"). The refactor moved both apps to npm (`package-lock.json`, no `yarn.lock`).
- Fixed `Dockerfile`: `npm install -g npm@11.17.0` (base ships npm 10.9, which fails `npm ci` with `Missing: @esbuild/linux-*@0.28.2 from lock file`), then `npm ci && npm run build` in `frontend` and `npm ci --omit=dev` in `backend`. Kept `pm2-runtime main.js`.
- Fixed `.dockerignore`: bare `node_modules/` and `dist/` only match the repository root. The build context was 552 MB and carried macOS binaries into the image. Now `**/node_modules/`, `**/dist/`, and `data/` (removed stale `api/data/`).
- Verified image (linux/arm64): build OK, frontend build OK, `sqlite3` 3.44.2 loads, server starts, migrations create 8 tables, `GET /` 200 SPA, `/api/settings` 200, unknown route 404 JSON, DB written to the mounted volume.
- Verified amd64 install/build under emulation: `npm ci`, vite build, and the `sqlite3` prebuilt binary all pass. The local daemon has no BuildKit, so `docker build --platform linux/amd64` cannot commit a foreign-platform image (fails at `COPY`; not a Dockerfile bug).
- Stale leftovers not touched (code, not docs): root `package.json` `packageManager: yarn@4.8.1`, root `.pnp.cjs`/`.pnp.loader.mjs`/`.yarn/`, and the `volta.yarn` fields in `frontend`/`backend` `package.json`.

## Session 2026-10-21 — Justfile

- Added `Justfile` at the repo root, following the sibling projects (`tasssks`, `emmmail`, `uptime`): `default` lists recipes; recipes carry `#` descriptions.
- Recipes: `install`, `start`, `start-backend`, `start-frontend`, `build`, `test`, `test-backend`, `test-frontend`, `docker-build *args`, `docker-run`, `docker-stop`.
- `start` runs the root `npm start` (concurrently) in the foreground; Ctrl+C stops both children.
- `docker-build` forwards extra args to `docker build` (e.g. `just docker-build --platform linux/amd64`). `docker-run` maps 8090 → 8083 and mounts `./tmp-data`; `tmp-data/` was added to `.gitignore`.
- `docs/knowledge/commands.md` now points at `just --list`.
- Verified: `just --fmt --check` OK; `just test` green (backend 42, frontend 114).

## Session 2026-10-21 — Release docs

- Renamed `bump.sh` → `bump-and-push-docker-image.sh`. No stale references were found in the repository.
- Documented the release flow in `README.md`, `docs/knowledge/commands.md`, and `docs/knowledge/env-notes.md`.
- README `mise` section now covers `mise trust`, `mise install`, shell activation, and `mise exec --`.
- Script facts for future work: it needs `jq` and BSD `sed` (`sed -i ''`); it updates only `frontend`/`backend` `package.json`; it tags `abtzco/bookkeepr:<version>` but pushes only `:latest`.

## Session 2026-10-21 — Release script --no-bump

- Added `--no-bump` (and `-h`/`--help`) to `bump-and-push-docker-image.sh`. It skips the prompt and `sed`, reads both `package.json` versions, and exits 1 when they differ.
- Bump mode now replaces each file's own version, so a frontend/backend mismatch can no longer leave one file unchanged.
- `--no-bump` commits with a pathspec limited to the two `package.json` files, so other staged work stays staged. It creates the tag only when missing.
- Docs updated: `README.md`, `docs/knowledge/commands.md`, `docs/knowledge/env-notes.md`.
- Verified in a throwaway git repo with a fake `docker`: bump updates both files; `--no-bump` commits only the two files, leaves other staged files alone, pushes the tag, and rejects mismatched versions. `bash -n` OK.

## Session 2026-10-21 — Docker deploy script

- Bare Deploy v1.4.0 is host-native: `type` accepts only `node`/`php`, and rollback re-points a symlink without restarting a container. Not used. No `bare.config.json` created.
- Added local `deploy.sh <version>`, listed in `.gitignore` and `.dockerignore`. It pulls `abtzco/bookkeepr:<version>`, tags the running image `:previous`, stops the container, backs up `bookkeepr.db`, restarts, and health-checks `/api/settings`. On failure it restarts `:previous`.
- Server facts: vps-4 `n4.abtz.co` (139.162.111.88), x86_64, HestiaCP site `/home/abtz/web/bookkeepr.abtz.co`, nginx → `127.0.0.1:8083`, data bind-mounted from `data/`. Container `bookkeepr`, `--restart always`.
- `abtz` is not in the `docker` group; `admin` has NOPASSWD only for Hestia scripts and cannot read `data/`. Root SSH with `linode_rsa` works. Deploy waits for `usermod -aG docker abtz`.
- The old container published `0.0.0.0:8083`, which bypassed nginx/TLS. The script now binds `127.0.0.1:8083`.
- `bump-and-push-docker-image.sh` now pushes the version tag too. Docs updated: `README.md`, `docs/knowledge/commands.md`, `docs/knowledge/env-notes.md`.
- Verified: `bash -n` OK; missing/invalid version prints usage; remote docker check exits 1 with the group instruction.
- Added `docs/knowledge/deployment.md` (server, access, publish, deploy, first deploy, verify, rollback, troubleshooting). Indexed in `AGENTS.md`; `commands.md` and `env-notes.md` link to it.
