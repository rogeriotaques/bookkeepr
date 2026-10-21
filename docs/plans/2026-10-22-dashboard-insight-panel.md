# Dashboard insight panel

status: done

## Goal

Replace the static greeting (`You're doing great!` / `Keep it up.`) with one
Kakeibo-style insight for the **current month**. The insight has a title (state)
and a subtitle (one concrete action). The annual cards stay annual.

## Decisions

- Insight is **monthly**; the cards around it stay annual.
- Rules run in the **backend** (`GET /api/reports/insight`).
- **One** insight per render.
- **Text only**: no link, no button.
- v1 uses the existing `fixed` / `variable` split. No schema change.
- No LLM. Deterministic rules only.
- The goal is a **ritual, not a metric**. v1 reads it only to detect whether it
  exists. It is never echoed, because it is free text the app cannot verify.

## Contract

```
GET /api/reports/insight?year=2026&month=10

{
  "success": true,
  "insight": { "code": "fast_pace", "title": "...", "subtitle": "..." }
}
```

- `code` is for tests and debugging. The frontend renders `title` and
  `subtitle` verbatim.
- Year and month use the existing `reportsService.validateYear` /
  `validateMonth`; invalid input returns 400.
- Currency is formatted in the backend as `¥ ` + `Math.round(value)
  .toLocaleString('en-US')`. That matches the dashboard's formatters, not the
  Report page, which uses the settings currency.
- Money is rounded to whole yen before formatting. Percentages are integers.

## Clock and month state

The endpoint accepts any year/month, so "today" must be explicit.

- `getInsight(knex, { year, month, today = dayjs() })`. The controller passes
  `dayjs()`; tests inject or fake the clock.
- `isCurrentMonth` and `isPastMonth` are computed from `today`.
- `dayOfMonth` / `daysLeft`:
  - current: `today.date()` / `daysInMonth - dayOfMonth + 1`
  - past: `daysInMonth` / `0`
  - future: `0` / `daysInMonth`
- Rules that depend on "today" (empty ledger, pace, goal nudge) run only for
  the current month. A past month falls to `month_closed`.
- Route tests use `vi.setSystemTime`; threshold tests live in the pure builder
  and pass `dayOfMonth` directly.

## Insight context

Built by the service. Pure rules consume this object, so they are testable
without a database.

```ts
{
  monthName,
  isCurrentMonth, isPastMonth,
  dayOfMonth, daysLeft,
  hasPlan, goal,                 // goal is trimmed, '' when null/blank
  monthPlanned: { income, expense },
  monthRealized: { income, expense },
  paceBasis: 'variable' | 'total',
  budgetLeft, dailyAllowance,    // 0 when the plan or days left is 0
  spentPct, elapsedPct,          // integers 0..100
  topOverspend: { label, planned, actual, delta } | null,
  entryCountThisMonth,           // expense entries only
  monthSurplus, plannedSurplus
}
```

Definitions:

- `hasPlan` = planned income + planned expense > 0. A budget **row** with no
  items is not a plan.
- `monthPlannedVariable` = sum of expense items whose `expense_type` is not
  `fixed`. `null` counts as variable.
- `monthRealizedVariable` = sum of expenses in groups whose `expense_type` is
  not `fixed`.
- `paceBasis = 'variable'` when `monthPlannedVariable > 0`, else `'total'`.
- `spentPct = round(100 * basisActual / basisPlanned)`, or `0` when
  `basisPlanned = 0`. Never `Infinity` or `NaN`.
- `elapsedPct = round(100 * dayOfMonth / daysInMonth)`.
- `budgetLeft = max(0, monthPlanned.expense - monthRealized.expense)`.
- `dailyAllowance = daysLeft > 0 ? round(basisLeft / daysLeft) : 0`, where
  `basisLeft` uses the same variable/total basis as the pace rule.
- `topOverspend` = the non-fixed category with the largest positive
  `actual - planned`, grouped by `group_code`, plan summed per group. Budgeted
  groups use the item's `expense_type`; unbudgeted groups use
  `groups.expense_type`. `label` comes from `groups.name` and is truncated to
  20 characters + `…`.
- `entryCountThisMonth` counts expense entries only, matching the copy.

## Rules (first match wins)

| # | Code | Condition | Title | Subtitle |
|---|---|---|---|---|
| 1 | `no_plan` | `!hasPlan` | `No plan for {Month}` | `Add income and expenses in Planning.` |
| 2 | `empty_ledger` | current month, `entryCountThisMonth = 0` | `Nothing logged yet` | `Add today's spending when you make it.` |
| 3 | `wealth` | plan expense `> 0`, actual `>` plan, monthly surplus `> 0` | `You are building wealth` | `You kept ¥X, even with ¥Y over plan.` |
| 4 | `over_budget` | plan expense `> 0`, actual `>` plan, monthly surplus `<= 0` | `You went over plan` | `You are ¥X over. Check {Label}.` |
| 5 | `income_short` | current or past, `dayOfMonth >= 20`, plan income `> 0`, actual `< 90%` of plan | `Income is below plan` | `¥X less than planned. Adjust this month.` |
| 6 | `category_over` | current, actual `<=` plan, `topOverspend` exists | `{Label} is over plan` | `¥X over, but you are ¥Y under overall.` |
| 7 | `fast_pace` | current, `dayOfMonth >= 7`, `spentPct - elapsedPct >= 10` | `Spending is a little fast` | `Hold variable spending to ¥Z a day.` |
| 8 | `no_goal` | current, `dayOfMonth <= 10`, `goal` empty | `What do you want this month?` | `Write your goal in Planning.` |
| 9 | `month_closed` | `daysLeft <= 2`, actual `<=` plan | `{Month} is nearly over` | `You spent ¥X, ¥Y under plan.` |
| 10 | `plan_met` | `dayOfMonth >= 20`, planned surplus `> 0`, monthly surplus `>=` planned surplus | `You met your plan` | `You kept ¥X. Move it to savings.` |
| 11 | `positive` | `dayOfMonth >= 20`, monthly surplus `> 0` | `You're doing great!` | `You kept ¥X this month.` |
| 12 | `on_plan` | `hasPlan` and entries exist | `You are on plan` | `¥X left for Y days.` |

Rule notes:

- A positive monthly balance outranks an over-plan expense. Spending ¥Y over
  plan is not a loss when the month still kept ¥X. `wealth` wins.
- Spending problems (4–6) outrank the goal nudge (8). A missing goal must not
  hide an overspend.
- `over_budget` fires only when actual is **strictly** greater than plan. A
  test pins "exactly at plan is not over".
- If `over_budget` has no `topOverspend` (the overspend is fixed), the subtitle
  reads `You are ¥X over. Review fixed costs.`
- `fast_pace` uses `paceBasis`; when the basis is `total`, the subtitle reads
  `Hold spending to ¥Z a day.`
- `month_closed` says `right on plan` when `¥Y` would be zero.
- `income_short` waits until day 20: salaries arrive late in the month.
- Positive rules wait until day 20: a salary on day 1 is not a saved month.
- The goal nudge is limited to the first 10 days, matching "plan at the start
  of the month". After that, real states win.

Copy limits, asserted in tests **after** interpolation: title `<= 40` chars,
subtitle `<= 90` chars. Test with a 20-char label, a 7-digit amount, and the
longest month name.

## Backend changes

- `backend/services/insights.js`
  - `buildInsight(context)` — pure, no `knex`.
  - `getInsight(knex, { year, month, today })` — queries, then builds.
  - `formatCurrency` — `¥ ` + rounded `en-US`. New helper, used by the rules.
  - Query set, all point or grouped queries:
    1. `monthly_budgets` for `year, month` (goal; unique index).
    2. `budget_items` left join `groups` for that budget, split income/expense
       in JS.
    3. expense actuals for the month: `entries` join `groups`, operation
       `outcome`, grouped by `entries.group`, with `SUM(amount)` and
       `COUNT(*)`.
    4. income actual total for the month.
  - Do **not** reuse `getOverviewReport` (12 × groups loop) or
    `getMonthlyReport`. The latter cannot be trusted for per-category
    aggregation: two items can share a `group_code` (double counting) and
    `group_code` is nullable. Reusing it would also change a public endpoint.
- `backend/controllers/reports.js` — `getInsight`, validate year and month,
  pass `dayjs()`.
- `backend/routes/reports.js` — `router.get('/insight', ...)`.
- `backend/serializers/reports.js` — `serializeInsight`.
- `backend/tests/insights.test.js`
  - One test per rule, plus priority order.
  - Boundaries: exactly at plan, exactly 10 points of pace, day 6/7, day 19/20,
    day 10/11, `daysLeft` 2/3, zero plan, income-only plan, goal `null` / `''`
    / whitespace, past month, future month.
  - Copy constraints after interpolation; long label truncation; large amounts.
  - Route: valid shape, invalid year, invalid month, fixed clock via
    `vi.setSystemTime`.

## Frontend changes

- `frontend/src/components/report/InsightPanel.vue`
  - Props: `insight: { title, subtitle } | null`, `loading: boolean`,
    `error: boolean`.
  - States: skeleton (`aria-hidden`), neutral error copy (`Insight
    unavailable` / `Refresh to try again.`), or the insight.
  - Title is the page's `h1`; subtitle is a `p`.
  - No `aria-live`: the card is present at mount and is read in normal order.
  - Move the `h1` / `p` typography from `DashboardPage` into this component.
    Parent scoped rules cannot reach inside it.
  - Root gets `class="box dashboard-page__heading"` from the page.
- `frontend/src/pages/DashboardPage.vue`
  - Add `const month = dayjs().month() + 1`.
  - **Create both `useDataFetch` calls before any `await`, then await both in
    one `Promise.all`.** `useDataFetch` calls `useQueryClient()`, which throws
    outside the setup injection context. The current `ReportPage` has this
    latent defect; do not copy it.
  - Delete the heading `div` at lines 6–9; render `InsightPanel` directly in
    `<header>`. Do not nest it inside the old `.box` (double box).
  - Pass `:insight="insightData?.insight"`, `:loading="insightLoading"`,
    `:error="insightError"`.
  - Keep the header hidden when the year has no budget. The insight request
    still runs and is discarded; that is accepted (one cheap request).
  - Month rollover needs a reload in v1. No timer, no `useNow`.
- `frontend/src/__tests__/InsightPanel.test.ts`
  - Renders title and subtitle as `h1` / `p`.
  - Skeleton while loading is `aria-hidden`.
  - Error copy is neutral and is not praise.
- `frontend/src/__tests__/DashboardPage.test.ts`
  - Replace `mockReturnValue` with `mockImplementation((url) => ...)` keyed on
    `url.value`, because the page now makes two requests.
  - Keep the existing copy assertion through a `positive` fixture.
  - Assert the insight URL includes the current month.
  - Assert the panel is absent when the year has no budget.
  - Add a page-level error test.
  - Keep `.dashboard-page__header` as the first grid child.

## Data notes

- `fixed` / `variable` is the v1 proxy for committed / discretionary.
  Non-fixed categories drive pace and `topOverspend`. `null` counts as
  variable.
- Actuals aggregate by `group_code`, not by budget-item label. Two items in the
  same group share one planned amount.
- Unbudgeted spending is a `topOverspend` candidate when its group is not
  fixed. Real data showed why: the month was over plan, every budgeted category
  was under, and the money sat in unbudgeted groups. Naming it is the useful
  advice; "review fixed costs" was wrong.
- The database column is `groups.operation = 'outcome'`, not `'expense'`.
  Mixing them returns zero rows and silently kills rules 3–5.

## Verification

1. `backend`: `npm test` — rule, copy, and route tests pass.
2. `frontend`: `npm test` — panel and page tests pass.
3. `npm run build`.
4. Manual fixtures through the real database:
   - annual budget exists, current month has no plan;
   - overspent variable category;
   - fixed-only overspend;
   - income short on day 21;
   - on-pace month with a goal;
   - last two days of the month.
5. Confirm one `/api/reports/insight` and one `/api/reports?year=` request per
   dashboard load before a window refocus. A refocus refetches (vue-query
   defaults), which is expected.

## Results

- Backend: 79 tests pass, 37 of them in `insights.test.js`.
- Frontend: 174 tests pass. `npm run build` OK.
- Real database, October 2026: `over_budget` / `You are ¥ 1,300 over.
  Check Business expenses.` The overspend sat in unbudgeted groups, which the
  first draft skipped. `topOverspend` now includes them.
- A month that spends over plan but keeps money now returns `wealth`
  (`You are building wealth` / `You kept ¥X, even with ¥Y over plan.`), not an
  overspend warning.

## Out of scope

- Kakeibo's four buckets (`survival` / `optional` / `culture` / `extra`).
- Structured numeric goals (target amount).
- A rotating list of insights.
- LLM-generated copy.
- Saving the insight, or a "dismiss" action.
- Reading the previous month for trend comparisons.
- Changes to the annual cards, chart, or recent transactions.
