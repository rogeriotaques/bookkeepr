import type { Router } from 'vue-router';

import type { HotkeyMap } from '@/composable/useHotkeys';

export interface HotkeyHelpItem {
  keys: string;
  label: string;
}

export interface HotkeyHelpGroup {
  title: string;
  items: HotkeyHelpItem[];
}

export const isMac = (): boolean =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export const modifierLabel = (): string => (isMac() ? '⌘' : 'Ctrl');

export const createGlobalHotkeys = (
  router: Pick<Router, 'push'> | undefined,
  actions: {
    openHelp: () => void;
    openLogout: () => void;
  }
): HotkeyMap => {
  const go = (path: string) => {
    router?.push(path);
  };

  return {
    '?': actions.openHelp,
    'g d': () => go('/'),
    'g t': () => go('/transactions'),
    'g p': () => go('/planning'),
    'g r': () => go('/report'),
    'g s': () => go('/settings'),
    'g c': () => go('/settings/groups'),
    'g w': () => go('/settings/wallets'),
    'g a': () => go('/settings/advanced'),
    'shift+l': actions.openLogout,
  };
};

export const hotkeyHelpGroups = (): HotkeyHelpGroup[] => {
  const mod = modifierLabel();

  return [
    {
      title: 'Navigation',
      items: [
        { keys: 'g d', label: 'Dashboard' },
        { keys: 'g t', label: 'Transactions' },
        { keys: 'g p', label: 'Planning' },
        { keys: 'g r', label: 'Report' },
        { keys: 'g s', label: 'Settings' },
        { keys: 'g c', label: 'Settings: Categories' },
        { keys: 'g w', label: 'Settings: Wallets' },
        { keys: 'g a', label: 'Settings: Advanced' },
        { keys: '?', label: 'Show this panel' },
        { keys: 'Shift+L', label: 'Log out' },
      ],
    },
    {
      title: 'Dashboard',
      items: [{ keys: 'n', label: 'Open a new entry' }],
    },
    {
      title: 'Transactions',
      items: [
        { keys: 'n', label: 'New entry' },
        { keys: `${mod}+I`, label: 'Focus the amount' },
        { keys: `${mod}+S`, label: 'Save the entry' },
        { keys: `${mod}+K or /`, label: 'Focus search' },
        { keys: 'j / k', label: 'Move the row cursor' },
        { keys: 'Space', label: 'Add or remove the row from the calculator' },
        { keys: 'Enter / e', label: 'Edit the focused row' },
        { keys: 'Delete / Backspace', label: 'Delete the focused row' },
        { keys: '[ / ]', label: 'Previous / next month' },
        { keys: 'Shift+[ / Shift+]', label: 'Previous / next year' },
        { keys: 't', label: 'Current month' },
        { keys: 'Esc', label: 'Clear search or selection' },
      ],
    },
    {
      title: 'Planning',
      items: [
        { keys: 'i', label: 'Income calculator' },
        { keys: 'e', label: 'Expenses calculator' },
        { keys: 'o', label: 'Focus the goal' },
        { keys: '[ / ]', label: 'Previous / next month' },
        { keys: 'Shift+[ / Shift+]', label: 'Previous / next year' },
        { keys: `${mod}+S`, label: 'Save now' },
        { keys: 'Esc', label: 'Close the calculator' },
      ],
    },
    {
      title: 'Report',
      items: [
        { keys: 'p', label: 'Print the report' },
        { keys: '[ / ]', label: 'Previous / next year' },
        { keys: 't', label: 'Current year' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { keys: 'n', label: 'Add a category or wallet' },
        { keys: 'j / k', label: 'Move the row cursor' },
        { keys: 'Enter / e', label: 'Edit the focused row' },
        { keys: 'Delete / Backspace', label: 'Delete the focused row' },
        { keys: 'Esc', label: 'Cancel the dialog' },
      ],
    },
    {
      title: 'Dialogs',
      items: [
        { keys: 'Esc', label: 'Cancel' },
        { keys: `${mod}+Enter`, label: 'Confirm' },
        { keys: `${mod}+S`, label: 'Save the form' },
        { keys: 'Tab / Shift+Tab', label: 'Stay inside the dialog' },
      ],
    },
  ];
};
