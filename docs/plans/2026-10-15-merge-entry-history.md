# Merge Entry and History into a single Transactions page

status: done

## Goal

Entry and History are two halves of the same job. Merge them into one
"Transactions" destination.

## Changes

1. **Routes.** `/entry` and `/history` are replaced by `/transactions`
   (`TransactionEntryPage`). Both old paths stay as redirects, so bookmarked
   hash URLs keep working.
2. **Navigation.** 5 tabs: Dashboard, Transactions, Planning, Report, Settings.
   The merged tab uses `IconReceipt`.
3. **`TransactionEntryPage`** wraps the two pieces side by side at `≥1024px`:
   `EntryForm` (380px, left) and `TransactionHistoryPage` (1fr, right).
   Below `1024px` it is one column, form first.
4. **`TransactionHistoryPage`** loses its page chrome (gutter, max-width, `h1`)
   and its `Cmd+I → /entry` shortcut. It is the history column now, and that
   shortcut fought `EntryForm`'s `Cmd+I` (focus the amount field).
5. `RecentTransactions` dropped from this page (the history table already lists
   the month). The component stays: the Dashboard uses it.

## Verification

- `npm test` — 71 passed. The count dropped from 75 because four tests about the
  retired pages and tabs were removed.
- `npm run build` — OK.
- Headless Chrome at 1440px and 375px: no page errors, and
  `document.documentElement.scrollWidth` equals the viewport (no overflow).
  - 1440px: form 380px at x=146, history 744px at x=550.
  - 375px: single column, both 343px wide; the table scrolls on its own.
- Long-value check: injected rows (`¥ 1,234,567`, 3-line descriptions) — the
  table still fits 744px, the description column takes the pressure, and the
  amounts stay on one line.
- `/entry` and `/history` both render the merged page.

## Notes

- `TransactionHistoryPage` keeps its name although it is no longer a route. The
  user referred to it by name.
- The table keeps its own horizontal scroll below 768px (`table-scroll`).
