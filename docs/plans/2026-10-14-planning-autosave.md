# Planning auto-save

- **Date:** 2026-10-14
- **Status:** done
- **Scope:** `frontend/src/pages/PlanningPage.vue`, `frontend/src/composable/useBudget.ts`

## Goal

Save the monthly plan as the user changes it, with debouncing. Remove the explicit
`Cancel` / `Done` buttons. Save status is silent; only errors show a toast.

## Behavior

- Goal textarea: debounced save, 600 ms after typing stops. Flush on blur.
- Income/Expenses calculators: save immediately when a calculator emits `update`.
- Month switch: flush any pending goal save for the previous month.
- Unmount (leave tab): flush pending save.
- Create-once: the first save creates the budget and stores its id; later saves update.
  Saves are serialized so a create never fires twice.
- On success, update the query cache with `setQueryData` (no refetch), so local edits
  are not clobbered while typing.

## Verification

- `npx vitest run` (frontend).
- Manual: type goal, change month, reopen month, confirm persisted.
