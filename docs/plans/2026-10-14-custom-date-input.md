# Custom Date Input (day-first focus)

status: done
date: 2026-10-14

## Goal

The native `<input type="date">` always focuses the **year** segment first, and
the segment cannot be selected programmatically (`setSelectionRange` throws,
synthetic key events are ignored, `lang` does not reorder). Replace it with a
custom masked date field so the autofocus lands on the **day**.

## Deliverable

- `frontend/src/components/shared/DateInput.vue`
  - Single `type="text"` field, mask `YYYY/MM/DD` (same visual order as before).
  - `v-model` = ISO `YYYY-MM-DD` (what `EntryForm`/API already use).
  - On focus: active segment = **day**.
  - Keys: digits overwrite/shift within segment, auto-advance; `←/→` move
    segment; `↑/↓` bump value; `Backspace/Delete` clears segment; `Paste`
    accepts ISO/`/`-separated dates.
  - Emits a value only when the date is complete and valid.
  - `defineExpose({ focus })` so the form can autofocus it.
- Integrate in `frontend/src/components/transactions/EntryForm.vue`
  (keep the calendar addon; remove the native input).
- Tests: `frontend/src/__tests__/DateInput.test.ts`.

## Out of scope

- Native calendar picker (dropped, per decision).

## Verification

- `npx vitest run` (new tests green, existing green)
- `npx vite build`
- Browser check: focus lands on day; typing updates the day; emitted ISO correct.
