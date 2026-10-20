# Print Report Review

## Status

done

## Problem

`CMD+P` prints the report badly:

1. Charts take a full page each, stacked on separate rows.
2. The mobile bottom navbar is printed.
3. The Pro Tip block is printed.
4. The paper is portrait, so the 13-column table is clipped on the right.

Root causes found:

- Boring's grid only splits columns inside `@media screen (min-width: 768px)`.
  Print matches no breakpoint, so every `.col-*` spans 12 columns.
- Chart.js keeps the canvas at its on-screen pixel size when printing, so a
  canvas can be wider than its printed column.
- `Dashboard.vue` has no print rule for its nav, and its content is a scroll
  container.
- `ProTip.vue` has no print rule.
- No `@page` rule, so the browser uses portrait.

## Changes

- `frontend/src/styles/bookkeepr.scss`: `@page` A4 landscape with 10mm margins;
  let `html`, `body` and `#app` grow past one viewport in print.
- `frontend/src/pages/ReportPage.vue`: restate the chart grid spans in print,
  hide the controls, print the insights above the charts, and print a bitmap
  snapshot of each chart (`beforeprint` -> `<img>`), because Chart.js may
  redraw mid-print and paint half a pie. Title is `Annual Report for <YEAR>`
  (opts out of the global Title Case). Chart wrappers are cards: 16px padding
  and the standard radius.
- `frontend/src/components/report/ReportInsights.vue`: keep the four boxes on
  one row in print.
- `frontend/src/components/report/ReportData.vue`: fit the 13-column table in
  landscape (smaller font/padding, narrower title), keep rows from splitting.
- `frontend/src/components/layout/Dashboard.vue`: hide the nav in print, drop
  the scroll container and the bottom-nav padding.
- `frontend/src/components/shared/ProTip.vue`: hide in print.

## Verification

- `cd frontend && npm test` — 101 tests pass.
- Chrome print-to-PDF (with `beforeprint` dispatched, like Cmd+P does), rendered
  with Ghostscript: 2 A4 landscape sheets. Sheet 1: `Annual Report for 2026`,
  32px gaps around the four insight boxes, then pie and bar side by side, both
  whole and paid out from their wrapper padding. Sheet 2: the whole table, no
  clipping. No navbar, no Pro Tip.

## Notes

- CSS media queries cannot be asserted from jsdom, so the print rules are
  verified through a real print-to-PDF run.
