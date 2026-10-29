# Double-Entry Support

**status: pending**

## Goal

Add double-entry bookkeeping as an option next to the current single-entry
flow. Existing data, reports, budgets, and insights must keep working. The user
chooses the method per entry. Single-entry stays the default.

## Current state

| Area | Today |
|---|---|
| `entries` | One row per transaction: `date`, `description`, `group` (code), `wallet` (id), `amount` |
| Sign | Implied by `groups.operation` (`income` or `outcome`) |
| `wallets` | Labels only. No balance, no type |
| Reports | Sum `entries.amount`, grouped by `groups.code` |
| Budgets | `budget_items.group_code` maps a plan line to a group |
| UI | `EntryForm` posts one amount, one category, one wallet |

There are no paired postings and no account types, so the app is single-entry
only. The README claim was removed on 2026-10-29.

## Target model

1. `accounts` is the chart of accounts. Each account has a kind: `asset`,
   `liability`, `equity`, `income`, or `expense`.
2. `postings` are signed lines of a journal entry. They must sum to zero.
3. `entries` becomes the journal header. It keeps `date` and `description` and
   gains `method` (`single` or `double`).
4. Every wallet is an `asset` or `liability` account. Every group is an
   `income` or `expense` account. Both keep their current rows and ids; the
   account row references them, not the reverse.
5. Single-entry posts two lines behind the scenes: the group account and the
   wallet account. The user sees the same form as today.
6. Double-entry lets the user add two or more lines with debit and credit
   amounts on any active account.

Debit is positive and credit is negative. Debit increases assets and expenses.
Credit increases liabilities, equity, and income.

## Design decisions

| # | Decision | Reason |
|---|---|---|
| 1 | One chart of accounts, not a second ledger | Reports, budgets, and insights read one source |
| 2 | `entries` + `postings`, no `journal_entries` table | The current table already is the header |
| 3 | Drop `entries.amount`, `group`, and `wallet` after backfill | Two sources of truth drift; the postings hold the data |
| 4 | Store amounts as `float` and compare at 0.005 | Keeps the existing column type and `v-money` flow. Normalise to 2 decimals on write |
| 5 | Wallet `kind`: `asset` or `liability` | A credit card is a liability. Net worth changes if it stays an asset |
| 6 | Accounts are deactivated, never deleted, when postings exist | A hard delete orphans postings and breaks the trial balance |
| 7 | A double-entry edit replaces all postings in one transaction | Same approach as `PUT /api/budgets/:id`. No line diffing |
| 8 | Seed equity accounts: Opening balances, Owner's equity, Retained earnings | Double-entry needs an equity side for opening balances and draws |
| 9 | Group accounts keep `groups.code`; wallet accounts keep `wallets.id` | Budgets, entries, and existing URLs keep their keys |
| 10 | `method` is per entry, not a global setting | A user can log a simple expense and still keep a loan schedule |

## Schema — migration 005

### `accounts`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, auto-increment |
| `code` | TEXT | NOT NULL, UNIQUE |
| `name` | TEXT | NOT NULL |
| `kind` | TEXT | NOT NULL, CHECK in (`asset`, `liability`, `equity`, `income`, `expense`) |
| `group_code` | INTEGER | NULL, UNIQUE, references `groups.code` |
| `wallet_id` | INTEGER | NULL, UNIQUE, references `wallets.id` |
| `active` | INTEGER | NOT NULL, default 1 |
| `created_at` | DATETIME | default `CURRENT_TIMESTAMP` |

- The `code` is a text code that sorts naturally: `1-1000` assets, `2-1000`
  liabilities, `3-1000` equity, `4-1000` income, `5-1000` expenses.
- `group_code` and `wallet_id` are optional. An account with neither is a
  manual account (bank loan, owner's equity).
- An account cannot have both `group_code` and `wallet_id`.
- Partial unique indexes enforce one account per group and one per wallet.
- `groups.code` is not unique today. Migration 005 adds a unique index before
  the foreign key, or the FK fails at creation. Check for duplicate codes first
  and stop with a clear error if any exist.

### `postings`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, auto-increment |
| `entry_id` | INTEGER | NOT NULL, FK `entries.id` ON DELETE CASCADE |
| `account_id` | INTEGER | NOT NULL, FK `accounts.id` ON DELETE RESTRICT |
| `amount` | REAL | NOT NULL, CHECK `amount <> 0` |
| `memo` | TEXT | NULL |

- Index on `entry_id` and on `account_id`.
- `entries` gains `method TEXT NOT NULL DEFAULT 'single'` with a CHECK in
  (`single`, `double`).
- `wallets` gains `kind TEXT NOT NULL DEFAULT 'asset'` with a CHECK in
  (`asset`, `liability`).
- SQLite does not enforce foreign keys unless the connection sets
  `PRAGMA foreign_keys = ON`. It is not set today (`backend/lib/db.js` only
  exposes `withTransaction`). Enable it in the migration and in the connection
  setup, then test that a posting with a missing account is rejected.

### Backfill

Run inside one transaction. For each existing `entries` row:

| `groups.operation` | Debit (positive) | Credit (negative) |
|---|---|---|
| `income` | wallet account | group account |
| `outcome` | group account | wallet account |

- Create one account per group (`kind` = `income` for `income`, `expense` for
  `outcome`) and one per wallet (`kind` = `asset`).
- Set `method = 'single'` for every backfilled row.
- Copy `amount` and use `''` for `memo`.
- Verify after backfill: zero entries, every entry sums to 0, and per-group
  annual totals match the pre-migration values.

### `down()`

Recreate `entries.amount`, `group`, and `wallet` from the two postings of each
`single` entry. Drop `postings`, `accounts`, `entries.method`, and
`wallets.kind`. Stop with an error if a `double` entry exists, because the
two-line shape cannot hold it.

## API

### Entries

| Method | Endpoint | Change |
|---|---|---|
| GET | `/api/entries?year=&month=` | Return `method` and `postings[]` with account code, name, and kind |
| POST | `/api/entries` | Accept `method: 'double'` with `postings[]`. Keep the current body for `single` |
| PATCH | `/api/entries/:id` | Same rule. Replace postings transactionally |
| DELETE | `/api/entries/:id` | Cascades to postings |

Single payload (unchanged):

```json
{ "date": "2026-10-29", "description": "Lunch", "amount": "1200", "group": 14, "wallet": 5 }
```

Double payload:

```json
{
  "method": "double",
  "date": "2026-10-29",
  "description": "Loan payment",
  "postings": [
    { "account": "2-1000", "amount": 50000 },
    { "account": "1-1000", "amount": -48000 },
    { "account": "5-2200", "amount": -2000 }
  ]
}
```

### Accounts

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/accounts` | Filter by `kind` and `active` |
| POST | `/api/accounts` | Reject a duplicate code or a group/wallet already linked |
| PATCH | `/api/accounts/:id` | Allow name and active. Do not allow `kind` when postings exist |
| DELETE | `/api/accounts/:id` | 409 when postings exist; use `active: 0` |

### Reports

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/reports?year=` | Same shape. Source from postings joined to accounts |
| GET | `/api/reports/insight?year=&month=` | Same rules. Replace the `entries` queries with posting aggregates |
| GET | `/api/reports/trial-balance?year=&month=` | New. Debits, credits, and balance per account. Total must be 0 |
| GET | `/api/reports/balance-sheet?asOf=` | New. Assets against liabilities plus equity |

## Validation

- `postings` has at least 2 items.
- Every `amount` is a number and not 0.
- The sum is 0 within 0.005.
- Every account exists and is active.
- `date` is valid and `description` is at most 255 characters.
- The request does not mix `amount`/`group`/`wallet` with `postings`.
- A `single` request still requires `group` and `wallet`.
- Amounts are rounded to 2 decimals before insert.

## Frontend

- `EntryForm`: add a method switch (`Simple` / `Double`).
  - Simple keeps the current fields.
  - Double shows a line grid: Account, Memo, Debit, Credit, Delete. `Add line`
    appends a row. Running totals show `Debit`, `Credit`, and the difference.
    Save is disabled until the difference is 0 and there are 2+ lines.
- History table: keep the current columns for `single`. For `double`, show the
  postings total and a `Double` tag. The row opens a detail modal.
- New `Settings -> Accounts` page: list, add, edit, deactivate. Show linked
  wallet or group, if any. Follow the existing `GroupTable`/`GroupForm`
  patterns, including the `j`/`k` cursor and `n` shortcut.
- Report page: add `Trial balance` and `Balance sheet` sections or tabs. Keep
  the current annual charts.
- `domain/interfaces.ts`: add `Account`, `Posting`, and `EntryMethod`; extend
  `Entry`.
- `domain/network`: add `getAccounts`, `saveAccount`, `deleteAccount`,
  `getTrialBalance`, `getBalanceSheet`.
- Hotkeys: `m` toggles the method in the entry form; `a` adds a journal line.
  Both go into `domain/hotkeys.ts` and the help panel.
- Print: the trial balance and balance sheet must use the existing A4 landscape
  print rules.

## Phases

| Phase | Scope | Done when |
|---|---|---|
| 1 | Migration 005, chart of accounts, backfill | Migration test passes; golden report totals match the pre-migration database |
| 2 | Read paths (entries, reports, insights, budgets) use postings | All existing backend and frontend tests pass with no behaviour change |
| 3 | Write paths: single and double payloads, accounts CRUD | New API tests pass; `single` requests produce two postings |
| 4 | Frontend double-entry form and history detail | Form balance guard, edit, and delete work; new component tests pass |
| 5 | Accounts settings page | CRUD, deactivate, and keyboard navigation work |
| 6 | Trial balance and balance sheet | Totals balance; print output fits two A4 landscape sheets |
| 7 | Docs and release | README describes both methods; `docs/knowledge/architecture.md` updated |

Do not ship until phase 2 is green. Stop after phase 2 in a separate PR if the
diff is too large to review at once.

## Tests

Backend:

- Migration 005 creates `accounts` and `postings`, backfills every entry, and
  leaves every entry balanced.
- Golden test: annual totals per group before and after the migration are equal.
- `single` save creates exactly two postings with the right signs.
- `double` save stores all lines; unbalanced input returns 400.
- A double entry with 3 lines keeps all 3 on update.
- Deleting an entry removes its postings; deleting a linked account returns 409.
- Trial balance sums to 0 for mixed data.
- Balance sheet: assets = liabilities + equity, including opening balances.
- Insights: the same fixtures return the same codes as today.

Frontend:

- Method switch shows and hides the journal grid.
- Save is disabled until debit equals credit.
- A zero-amount line is rejected before the request.
- History shows the `Double` tag and opens the detail modal.
- Accounts page CRUD and keyboard cursor.

## Verification

```sh
just test
just build
```

Manual:

1. Copy `data/bookkeepr.db` to a scratch file, run the migration, compare the
   annual report before and after.
2. Record a simple expense, then a loan payment with 3 lines.
3. Confirm history, budgets, dashboard insight, trial balance, and balance
   sheet.
4. Print both new reports to A4 landscape.
5. Restart the server to prove the migration is idempotent.

## Risks

| Risk | Mitigation |
|---|---|
| Backfill corrupts production data | Backup before deploy (`deploy.sh` already copies the DB); test on a copy; wrap in one transaction |
| Float rounding leaves an entry off by 0.01 | Round to 2 decimals on write; compare with 0.005; test odd amounts |
| Credit cards become liabilities and net worth drops | Decide the default before the migration; document the change; show a one-time notice |
| Insights copy and thresholds change | Keep the same fixtures and assert the same codes |
| Budget mapping breaks | `budget_items.group_code` still points at `groups.code`; join through `accounts.group_code` |
| Reports slow down | Replace the 12 × groups loop with grouped aggregates; add indexes on `postings.account_id` and `postings.entry_id` |
| Old clients send the old payload | `single` stays the default and accepts the current body |

## Out of scope

- Multi-currency and exchange rates.
- Bank reconciliation and imports.
- Attachments and recurring entries.
- Period locking and closing entries.
- Cash-flow and equity statements.
- Changes to the password/auth model.

## Open questions

1. Should a credit card be a `liability` from day one, or stay an `asset` with a
   negative balance? This changes net worth on the dashboard.
2. Is the method a per-entry choice (recommended), or a global app setting that
   hides the other form?
3. Should `single` support splitting one amount across several categories? It
   is a small step from there to full double-entry.
4. Do you want opening balances entered per account, or a single equity line?
