# Keyboard Navigation

**Status: done**

## Goal

Let a user operate every page without a mouse. Add one central hotkey
dispatcher, page and table shortcuts, a shortcut help panel, and the focus
fixes that make the shortcuts usable.

## Key map

### Global

| Key | Action |
|---|---|
| `g` `d` | Dashboard |
| `g` `t` | Transactions |
| `g` `p` | Planning |
| `g` `r` | Report |
| `g` `s` | Settings |
| `g` `c` / `g` `w` / `g` `a` | Settings Categories / Wallets / Advanced |
| `?` | Show the shortcut panel |
| `Shift+L` | Log out, with confirmation |

`Cmd` means `⌘` on macOS and `Ctrl` on Windows/Linux. The app accepts both.

### Dashboard

| Key | Action |
|---|---|
| `n` | Open a new entry |

### Transactions

| Key | Action |
|---|---|
| `n` | Focus the amount field |
| `Cmd+I` | Focus the amount field |
| `Cmd+S` | Save the entry |
| `Cmd+K` or `/` | Focus search |
| `j` / `k` or `↓` / `↑` | Move the row cursor |
| `Space` | Add or remove the focused row from the calculator |
| `Enter` or `e` | Edit the focused row |
| `Delete` or `Backspace` | Delete the focused row, with confirmation |
| `[` / `]` | Previous / next month |
| `Shift+[` / `Shift+]` | Previous / next year |
| `t` | Current month |
| `Esc` | Clear search, then selection |

### Planning

| Key | Action |
|---|---|
| `i` | Income calculator |
| `e` | Expenses calculator |
| `o` | Focus the goal |
| `[` / `]` | Previous / next month |
| `Shift+[` / `Shift+]` | Previous / next year |
| `Cmd+S` | Save now |
| `Esc` | Close the calculator |

### Report

| Key | Action |
|---|---|
| `p` | Print |
| `[` / `]` | Previous / next year |
| `t` | Current year |

### Settings

| Key | Action |
|---|---|
| `n` | Add a category or wallet |
| `j` / `k` or `↓` / `↑` | Move the row cursor |
| `Enter` or `e` | Edit the focused row |
| `Delete` or `Backspace` | Delete the focused row, with confirmation |
| `Esc` | Cancel the open modal |

### Modals

| Key | Action |
|---|---|
| `Esc` | Cancel |
| `Cmd+Enter` | Confirm |
| `Tab` / `Shift+Tab` | Stay inside the modal |

## Implementation

1. `composable/useHotkeys.ts`: one document listener, scope registry,
   `g` sequences, editable and modifier guards, block counter for overlays.
2. `composable/useFocusTrap.ts`: focus first control, wrap `Tab`, restore focus.
3. `composable/useTableCursor.ts`: shared `j`/`k` row cursor for the three tables.
4. `domain/hotkeys.ts`: global handler factory and help-panel data.
5. `components/shared/ShortcutHelp.vue`: help panel, opened with `?` and from
   the navbar question-mark icon (desktop only). It is one stacked column with a
   description search and an empty state.
6. Pages register their own keys. Existing component listeners move to the
   dispatcher.
7. Tables: action links become buttons, rows become focusable, and the focused
   row is visible.
8. `TransactionEntryPage` wires the existing `edit` event so the row action and
   the `Enter` key work.

## Guards

- Single letters do nothing while focus is in an input, textarea, select, or
  contenteditable.
- Modifier chords still work in fields.
- A dropdown, modal, or help panel blocks page keys.
- The `g` prefix expires after 1.2 seconds.
- A handler can return `false` to let a lower scope try.

## Verification

- `cd frontend && npm test` — 167 tests pass.
- `cd frontend && npm run build` — OK.
- Manual: load each page, press `?`, then use the keys without a mouse. Use
  `Tab` to reach every action.

## Notes

- `BalanceFilterForm` no longer focuses search when the page mounts. The field
  grabbed focus before the user could use page keys, and it opened the mobile
  keyboard. `Cmd+K` and `/` focus it.
- `BaseModal` and `BaseConfirmModal` now start their watchers immediately, so
  the calculators (which mount open) get Escape support too.
- `BaseConfirmModal` focuses Cancel first. Use `Tab` to the confirm button, or
  `Cmd+Enter`, to confirm. `Cmd+S` stays a form-only shortcut.
