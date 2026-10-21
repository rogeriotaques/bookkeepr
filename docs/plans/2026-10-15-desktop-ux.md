# Desktop UX Pass

status: done

## Goal

Improve the desktop experience of the 2.0 mobile-first design. Mobile stays
unchanged below `768px`/`1024px`.

## Changes

1. **Top nav at desktop (`≥1024px`).** `components/layout/Dashboard.vue` moves
   the tab bar to a sticky top bar (5 tabs + Logout). The fixed bottom tab bar
   stays below `1024px`.
2. **Wide layout token.** Add `--bk-max-width-wide: 1180px` to `tokens.scss`.
   Use it for Dashboard, History, Planning, Entry. Forms keep `600px`.
3. **Two-column pages (`≥1024px`).**
   - Dashboard: summary + progress + annual chart (left), recent transactions (right).
   - History: filters above, table full width.
   - Entry: form (left), recent transactions (right).
4. **Dashboard header.** Drop the 5 quick-action buttons (the nav covers them).
   Keep "Record new expense" (primary) and Logout in the header.
5. **Type scale at desktop.** Page `h1` becomes `--bk-text-3xl` at `≥1024px`.
6. **Annual chart on the Dashboard.** New `components/report/AnnualChart.vue`
   renders the `/reports?year=` data. The old `/report` route stays removed
   (`router.test.ts` asserts this).

## New components

- `components/report/AnnualChart.vue` — chart.js bar + balance line. Fetches `/reports?year=`.
- `components/transactions/RecentTransactions.vue` — last N entries of the month.

## Verification

- `frontend`: `npm test` — 74 passed (baseline 63).
- `frontend`: `npm run build` — OK.
- Manual browser check: **blocked**. `terminal-browser` cannot find the Ghostty pane
  from the agent shell, and no browser MCP is configured. Checked the compiled
  CSS instead (5 `min-width: 1024px` blocks, wide token, grid + nav rules).
  Please eyeball `localhost:5173` at 375px / 1024px / 1440px.

## Deviations

- `/report` is **not** re-routed: `router.test.ts` asserts the route stays removed.
  The chart now lives on the Dashboard (`AnnualChart.vue`).
- Planning got a two-column grid (goal left, totals right). A wide single column
  would have stretched the goal textarea.

---

# Round 2 — feedback from the first desktop screenshot

1. **Navbar overlapped the content.** Root cause: the base rule is
   `position: fixed` and the desktop media query never overrode `position`.
   Fixed with `position: sticky`.
2. **Navbar buttons looked like boxed widgets.** Boring styles every bare
   anchor (`a:not(.button):not(.card__link)`, specificity 0,2,1) with a bottom
   border and a hover highlight. The tabs are now styled from
   `.dashboard__nav .dashboard__tab` (0,3,0), which wins without `!important`.
3. **"Record new expense" removed.** The Entry tab covers it.
4. **Chart legend moved to the left.** Its labels were clipped because chart.js
   measured them before the Archivo webfont loaded; the legend font family is
   now pinned to `Archivo, sans-serif` at 11px. The chart is hidden below
   `1024px` (a 21-item left legend does not fit a phone); the Report page has it.
5. **Report page restored** at `/report` with a nav tab (6 tabs). `router.test.ts`
   now asserts the route exists. Two bugs found while re-enabling it:
   `ReportPage`'s own `display: flex` on `__insights` beat Boring's `.row` grid
   (cards collapsed), and the chart had no height (rendered blank).
6. **Lighter progress red** via the new `--bk-danger-light` token, used by the
   Dashboard and History progress bars.

Verified with headless Chrome screenshots at 375px and 1440px: Dashboard,
Entry, History, Planning, Report. No page errors.


## Files

- `frontend/src/styles/tokens.scss`
- `frontend/src/components/layout/Dashboard.vue`
- `frontend/src/pages/DashboardPage.vue`
- `frontend/src/pages/TransactionHistoryPage.vue`
- `frontend/src/pages/TransactionEntryPage.vue`
- `frontend/src/pages/PlanningPage.vue`
- `frontend/src/components/report/AnnualChart.vue` (new)
- `frontend/src/components/transactions/RecentTransactions.vue` (new)
- tests: `Dashboard.test.ts`, `DashboardPage.test.ts`, `TransactionEntryPage.test.ts`,
  `AnnualChart.test.ts` (new), `RecentTransactions.test.ts` (new)
