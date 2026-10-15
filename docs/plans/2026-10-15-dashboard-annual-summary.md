# Dashboard: annual budget summary and progress

status: done

## Goal

The Dashboard showed the **current month's** budget, actual and spending
progress next to the **annual** chart. Make both cards annual.

## Changes

- `DashboardPage` asks `/reports?year=` (the same endpoint the annual chart
  uses) instead of `useBudget(year, month)` + `useMonthlyReport(year, month)`.
- Annual budget = the sum of `budgets[].budget` (one row per month that has a
  budget). Annual actual = `insights.thisYear.outcome` (every expense entry in
  the year, including months without a budget).
- Balance = budget − actual. Progress = actual / budget.
- Copy: the summary card is titled **"Annual budget {{ year }}"** and its
  progress card reads **"Annual spending progress"**. Empty states are now
  "No budget set for `year`" and "No transactions recorded this year."

## Notes

- **No backend change.** `/reports?year=` already returns `budgets[]` and
  `insights.thisYear.outcome`.
- Everything is computed from one request: `useDataFetch` keys its vue-query
  cache as `['fetch', url]`, so the page and `AnnualChart` share the same cache
  entry. Confirmed with CDP `Network`: exactly one `/api/reports?year=2026` call
  with both components mounted.
- `DashboardPage` now uses top-level `await`, so it relies on the same
  `<Suspense>` in `App.vue` that `EntryForm` and `AnnualChart` already use. Its
  test mounts through the shared `mountWithSuspense` helper.

## Verification

- `npm test` — 72 passed. `DashboardPage.test.ts` was rewritten around the
  annual report mock; it asserts the summed totals (¥3,000 from
  1000+2000+0), the 50% progress, and the "Annual budget <year>" label.
- `npm run build` — OK.
- Headless Chrome at 1440px and 375px: no page errors, 1 reports request.
- **End-to-end aggregation check.** On the real database the annual totals equal
  October's (only October has a budget), so a screenshot cannot tell monthly
  from annual. I intercepted `/api/reports` with CDP `Fetch.fulfillRequest` and
  served three crafted months (1000 + 2000 + 3000) with
  `insights.thisYear.outcome = 3000`. The page rendered **¥6,000 / ¥3,000 /
  ¥3,000** and **50%**, from a single request — no month carries those numbers.

## Left alone

- `TransactionHistoryPage` keeps the monthly summary bar; the history is
  filtered by month, so monthly is correct there.
- `RecentTransactions` stays monthly ("Oct 14").
