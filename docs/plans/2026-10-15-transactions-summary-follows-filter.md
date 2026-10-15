# Transactions: summary follows the year/month filter

status: done

## Problem

On `/transactions` the budget summary bar (Budget / Actual / Progress) was stuck
on the month the page mounted on. Selecting May 2026 still showed October's
figures, while the table below switched to May.

Root cause, `TransactionHistoryPage`:

```ts
useBudget(Number(year.value), Number(month.value));
useMonthlyReport(Number(year.value), Number(month.value));
```

`Number(year.value)` is read once during setup, so both composables were pinned
to that snapshot. The entries table was fine because its URL is a `computed`.

## Changes

1. `useMonthlyReport` now takes `MaybeRefOrGetter<number>` and unwraps it with
   `toValue`, with `queryKey: computed(...)`. `useBudget` already worked this
   way; this brings the two in line. `queryFn` reads `toValue(year)`/`toValue(month)`
   so the request matches the key.
2. `TransactionHistoryPage` passes `computed(() => Number(year.value))` and
   `computed(() => Number(month.value))` instead of snapshots. vue-query then
   refetches by itself when the key changes — no manual invalidation needed.

## Verification

- `npm test` — 74 passed (19 files).
  - New `useMonthlyReport.test.ts`: a real `QueryClient`, asserts the refetch
    and the new value after the month ref changes (same shape as the existing
    `useBudget.test.ts`).
  - `TransactionHistoryPage.test.ts`: asserts both composables receive a
    reactive source, by unwrapping the captured arguments after emitting
    `update:year` / `update:month` from the filter stub. The old code fails this
    with `expected 2026 to be 2025`.
- `npm run build` — OK.
- Headless Chrome, real app: loaded `/transactions` (2026/October →
  ¥1,700 / ¥1,000 / 59%), then drove the month dropdown to **May** →
  **¥0 / ¥0 / 0%**, matching `GET /api/reports/monthly?year=2026&month=5`, with a
  new `month=5` request issued and no page errors.
