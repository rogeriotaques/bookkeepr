# Phase 4: Mobile-First Redesign & Budget Planning

## Overview

Transform BookKeepr from a desktop-oriented transaction logger into a **mobile-first personal finance app** with a Dashboard home screen, monthly budget planning (Income/Expenses calculators), and separated transaction entry/history flows. The existing password-based auth remains unchanged.

**Out of scope for this phase:**
- Dynamic greeting copy on Dashboard ("You're doing great!" will be static for now). Dynamic copy based on spending status and thresholds is planned for Phase 5.
- Magic link authentication. Password-based auth stays as-is.

**CSS Framework:** The app uses [boring-css](https://github.com/rogeriotaques/boring-css) (v1.0.0) which is already vendored in `frontend/src/styles/`. All new components must continue to use boring-css utility classes and CSS variables. Mobile-specific overrides should live in `bookkeepr.scss` or component-scoped styles.

---

## Phase 4.1: Database Schema Evolution

### 4.1.1 Groups Table Enhancement
Add `expense_type` to `groups` (categories) to support Fixed vs Variable classification in the Expenses Calculator.
- Column: `expense_type TEXT` with check constraint: `('fixed', 'variable', NULL)`
- Default `NULL` for income categories
- Update seed data: classify default outcome groups (e.g., Rent → Fixed, Food → Variable)

### 4.1.2 Budget Tables (New)
Create two new tables to store monthly plans.

**`monthly_budgets`**
| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, auto-increment |
| `year` | INTEGER | NOT NULL |
| `month` | INTEGER | NOT NULL (1-12) |
| `goal` | TEXT | DEFAULT '' |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
- Unique index on `(year, month)`

**`budget_items`**
| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, auto-increment |
| `budget_id` | INTEGER | NOT NULL → FK `monthly_budgets.id` ON DELETE CASCADE |
| `type` | TEXT | NOT NULL CHECK ('income', 'expense') |
| `label` | TEXT | NOT NULL DEFAULT '' |
| `group_code` | INTEGER | Nullable → references `groups.code` |
| `amount` | REAL | NOT NULL DEFAULT 0.0 |
| `expense_type` | TEXT | CHECK ('fixed', 'variable', null) |
| `sort_order` | INTEGER | DEFAULT 0 |

### 4.1.3 Data Integrity & Cleanup
- Enable SQLite foreign key enforcement (`PRAGMA foreign_keys = ON`)
- Drop the unused `filters` table (dead code from earlier migration)
- Add `ON DELETE` behavior for `entries.group` (SET NULL or block deletion of groups with entries)

---

## Phase 4.2: API Layer Expansion

### 4.2.1 Budget Endpoints (`/api/budgets`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `?year=&month=` | Fetch budget + all items for a month |
| POST | `/` | Create budget with items (transactional) |
| PUT | `/:id` | Update goal and replace all items (transactional) |
| DELETE | `/:id` | Delete budget (cascades to items) |

### 4.2.2 Updated Groups Endpoints
- `POST /api/groups` and `PATCH /api/groups/:id` accept optional `expense_type`
- `GET /api/groups` includes `expense_type` in response

### 4.2.3 Updated Reports Endpoints
- `GET /api/reports` (annual): Include budget vs actual per month where budget exists
- `GET /api/reports/monthly?year=&month=` (new): Return category-level budget vs actual breakdown, plus progress percentage

### 4.2.4 Validation
- Budget items array must be validated (positive amounts, required fields)
- Year/month must be valid calendar values
- `group_code` must reference an active outcome group when `type='expense'`

---

## Phase 4.3: Frontend Architecture & Navigation

### 4.3.1 New Route Structure
| Route | Component | Notes |
|---|---|---|
| `/` | `DashboardPage.vue` | **New home screen** |
| `/entry` | `TransactionEntryPage.vue` | Form only (extracted from current `/`) |
| `/history` | `TransactionHistoryPage.vue` | Monthly list + filters (extracted from current `/`) |
| `/planning` | `PlanningPage.vue` | Budget setup shell |
| `/settings/*` | Existing settings pages | Refactored styling |

**Note:** The Income/Expenses Calculators from the wireframe are implemented as **modals or inline expandables** within `/planning`, not separate routes, to preserve context.

### 4.3.2 Mobile-First Layout
- **Bottom Tab Navigation** for primary screens on mobile:
  - Dashboard | Entry | History | Planning | Settings
- **Top Navigation Bar** for desktop (or keep bottom tabs centered)
- Create `MobileLayout.vue` with safe-area-inset padding for notched devices
- Implement page transitions (slide-left for drill-down, slide-right for back)

### 4.3.3 Design System
- Create `frontend/src/styles/tokens.scss`:
  - Colors: primary (green), danger (red), surface, background, text-primary, text-secondary
  - Spacing scale: 4px base (xs=4, sm=8, md=16, lg=24, xl=32)
  - Border radius, shadows, typography scale
- Refactor all pages/components to consume tokens
- Ensure touch targets are **minimum 44×44px**

---

## Phase 4.4: Dashboard Page (New)

### 4.4.1 Layout
- **Header**: Static greeting ("You're doing great!") + Month/Year selector
- **Summary Cards** (3-up): Budget | Actual | Balance
- **Progress Bar**: Spending progress (`actual / budget` for expenses)
- **Quick Actions**:
  - Record new expense → `/entry`
  - Transaction History → `/history`
  - Planning → `/planning`
  - Settings → `/settings`
  - Sign Out

### 4.4.2 Data Requirements
- Fetch current month's budget from `GET /api/budgets`
- Fetch current month's actuals from `GET /api/entries` or `GET /api/reports/monthly`
- Computed values:
  - **Budget** = sum of all expense budget items
  - **Actual** = sum of all expense entries for the month
  - **Balance** = Budget − Actual
  - **Progress %** = (Actual / Budget) × 100

### 4.4.3 Empty States
- No budget for month → CTA: "Set up your budget for January"
- No transactions yet → "No transactions recorded this month"

---

## Phase 4.5: Planning Module (New)

### 4.5.1 Planning Page Shell
- **Month Selector**: "Planning for [January ▼]"
- **Goal Textarea**: Free-text goal for the month
- **Expected Total Income**: Read-only total with [+] button → opens Income Calculator
- **Expected Total Expenses**: Read-only total with [+] button → opens Expenses Calculator
- **Actions**: Cancel (discards changes) | Done (saves budget)

### 4.5.2 Income Calculator (Modal/Expandable)
- **Total** displayed at top (auto-sums)
- **Rows**: Label (free text) + Amount (money input) + Delete (×)
- **Add** button appends empty row
- No category linkage — income items are just labeled line items

### 4.5.3 Expenses Calculator (Modal/Expandable)
- **Total** displayed at top (auto-sums)
- **Rows**:
  - Type dropdown: Fixed | Variable
  - Category dropdown: Active outcome groups from `GET /api/groups`
  - Amount: Money input
  - Delete: (×)
- **Add** button appends empty row
- Category dropdown filters or defaults based on group `expense_type`

### 4.5.4 Save Behavior
- Done button triggers `POST /api/budgets` or `PUT /api/budgets/:id`
- Include: `goal`, `year`, `month`, and full `items` array
- Use Vue Query mutation with loading state and toast feedback
- On success: close calculators, return to Planning shell

---

## Phase 4.6: Transaction Module (Refactored)

### 4.6.1 Transaction Entry Page (`/entry`)
- **Extract** `EntryForm.vue` from current `NewEntryPage.vue`
- Keep all existing behavior:
  - Money masking (`v-money`)
  - Hotkeys: `Cmd+S` (save), `Cmd+I` (new)
  - Category dropdown, Wallet dropdown, Date picker, Description
- Add link: "View transaction history →"
- On save: show success toast, clear form for next entry

### 4.6.2 Transaction History Page (`/history`)
- **Extract** `BalanceTable.vue` and `BalanceFilterForm.vue` from current `NewEntryPage.vue`
- Add **Budget Summary Bar** at top:
  - Budget: ¥XXX | Actual: ¥XXX | Progress: XX%
- Keep existing table features:
  - Day / Description / Income / Expense / Subtotal (running balance)
  - Click-to-select rows with calculator
  - Search/filter + month/year selectors
- Add link: "← Record new expense"

### 4.6.3 Component Reorganization
- Move transaction components from `components/new-entry/` to `components/transactions/`
- Rename `NewEntryPage.vue` references accordingly

---

## Phase 4.7: Settings Refactor

### 4.7.1 Categories Page (`/settings/groups`)
- Update `GroupForm.vue`: Add `expense_type` dropdown (visible only when Operation = Outcome)
- Update `GroupTable.vue`: Add `expense_type` column
- Match wireframe columns: Code | Name | Operation | Status | Actions
- Wireframe shows Return button → simple back navigation to `/settings`

### 4.7.2 Wallets & Advanced
- Retain all functionality
- Apply new design tokens and mobile layout

---

## Phase 4.8: Shared Components Bug Fixes & Refactor

The following components in `frontend/src/components/shared/` have known bugs that must be fixed before/during the redesign.

### 4.8.1 BaseDropdown.vue
**Bugs:**
1. **Syntax error (line 249):** `await await wait(100)` — double `await` causes a runtime error.
2. **Over-aggressive `preventDefault` (line 208):** Blocks Tab key globally when dropdown is open, breaking form navigation.
3. **No keyboard wrapping:** ArrowDown at last item does not wrap to first item (and vice versa).
4. **Potential listener leak:** `onBeforeUnmount` removes `noscroll` class but the `watch(isOpen)` may still try to remove event listeners after component is unmounted.

**Fixes:**
- Remove double `await`
- Only call `event.preventDefault()` for keys that actually need it (ArrowDown, ArrowUp, Enter, Escape) — allow Tab to pass through
- Add wrapping logic to `navigateItems`
- Use `onMounted`/`onBeforeUnmount` lifecycle hooks for cleanup instead of relying solely on the watcher

### 4.8.2 BaseModal.vue
**Bugs:**
1. **Fragile DOM queries:** Uses `document.querySelector('.base-modal__overlay')` which breaks when multiple modals are open.
2. **Shared global listeners:** `body` keydown listeners are added/removed on `body` — opening/closing one modal removes listeners for all open modals.
3. **Unnecessary `:key`:** `:key="props.title"` forces re-renders when title changes.

**Fixes:**
- Use template refs (`ref` on the overlay element) instead of `document.querySelector`
- Maintain a global open-modal stack or use a single event listener that checks if the modal is the top-most open one
- Remove `:key` from the overlay div

### 4.8.3 BaseConfirmModal.vue
**Bugs:**
1. **Expensive `:key`:** `:key="JSON.stringify(props)"` forces a full re-render on every prop change and is computationally expensive.
2. **Same global listener issues** as BaseModal.
3. **`closeWithOutsideClick` is not reactive:** Computed property is read once in the watcher but not tracked if `preventOutsideClick` changes dynamically.

**Fixes:**
- Remove `:key` entirely
- Use template refs for overlay click handling
- Read `preventOutsideClick` directly inside the click handler instead of caching it

### 4.8.4 ProTip.vue
**Bugs:**
1. **Runtime crash risk (line 32):** `TIPS[props.target]` can be `undefined` if target doesn't exist, causing `Cannot read properties of undefined (reading 'length')`.
2. **Tip flickers on re-render:** `currentTip()` is called directly in the template, so it returns a new random tip on every reactive update.

**Fixes:**
- Add a fallback: `const tips = TIPS[props.target] ?? []`
- Use `computed` to memoize the selected tip so it only changes when `props.target` changes

### 4.8.5 BaseSkeleton.vue
**Bugs:**
1. **Hardcoded `max-width: 800px`** limits flexibility in narrow containers.
2. **Conflicting props:** `centered` and `right` can both be true with no resolution logic.

**Fixes:**
- Remove or parameterize `max-width`
- Add prop validation or CSS precedence so `centered` and `right` are mutually exclusive

### 4.8.6 BaseProgress.vue
**Bugs:**
- `height` prop has no default value. If omitted, the inline style renders `height: undefined` which may cause layout issues in some browsers.

**Fixes:**
- Add a sensible default height (e.g., `'4px'`)

---

## Phase 4.9: Polish & Quality Assurance

### 4.9.1 Responsive Verification
- Test on viewports: 375px (mobile), 768px (tablet), 1024px+ (desktop)
- Verify bottom nav doesn't obscure content
- Test numeric keyboard on money inputs
- Ensure modals are scrollable on small screens

### 4.9.2 Performance
- Lazy load Planning modals
- Consider virtual scrolling for Transaction History if >100 entries/month
- Optimize re-renders in calculator item lists

### 4.9.3 Accessibility
- `aria-label` on all icon-only buttons
- WCAG AA color contrast
- Keyboard navigation in modals and dropdowns
- Focus trap in calculator modals

### 4.9.4 Migration & Backward Compatibility
- Test DB migrations on a copy of production data
- Old entries display correctly without budgets
- Old groups without `expense_type` default gracefully

---

## Implementation Roadmap

Because this is a large refactor, I recommend **7 sprints**:

| Sprint | Phase(s) | Focus |
|---|---|---|
| **1** | 4.1 + 4.2 | Backend: Schema migrations, API endpoints, validation |
| **2** | 4.3 | Frontend: Routes, layout shell, design tokens, navigation |
| **3** | 4.4 + 4.5 | Dashboard + Planning module (the biggest new feature) |
| **4** | 4.6 | Transaction Entry + History extraction and redesign |
| **5** | 4.7 | Settings updates and category expense types |
| **6** | 4.8 | Shared components bug fixes and refactor |
| **7** | 4.9 | Responsive QA, performance, accessibility, polish |

---

## Key Technical Decisions

1. **Auth stays password-based:** Magic link is out of scope. Restyle `AuthPage.vue` but keep existing `Basic Auth` + `config.passwd` flow.
2. **Calculators are modals:** To keep planning context (month, goal) visible, Income/Expenses calculators open as modals/overlays on `/planning`, not separate routes.
3. **Budget items are replaced on save:** The PUT endpoint deletes old items and inserts new ones. This is simpler than diffing for a single-user app.
4. **Annual Report page:** The wireframe does not include the current Chart.js annual report. I recommend **deprecating `/report`** and integrating charts into the Dashboard later if needed. The `chart.js` dependency stays.
5. **No PWA/service worker:** Out of scope. Keep it a responsive web app.
6. **CSS Framework:** Continue using boring-css. Mobile overrides go in `bookkeepr.scss` or component-scoped `<style>` blocks.

---

## Tests to Add

- Unit test for `safeCompare` (equal, different length, different content)
- Unit test for `verifyPassword` (PBKDF2 format, SHA-256 fallback, migration trigger)
- Integration test for CORS rejection
- Integration test for SQL injection attempt returning 400, not 500
- Integration test for rate limiting after N failed logins
- Unit tests for the validation helper
- Integration tests for 404 and 500 error handlers
- Integration tests verifying consistent response shapes for all endpoints
- Unit test for `useState.ts` (login, logout, persistence)
- Unit test for `useDataFetch.ts` (no auth header when unauthenticated, 401 triggers event)
- Component test for `AuthPage.vue` (form submission, error display)
