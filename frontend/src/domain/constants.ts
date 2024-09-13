import { POSITION } from 'vue-toastification';

// @ts-expect-error
export const BASE_URL = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8083/api';

export const ENTRY_OPERATIONS = {
  INCOME: 'income',
  EXPENSE: 'outcome',
} as const;

export const AUTH_COOKIE_NAME = '_bk.a';

export const TOAST_BASE_SETTINGS = {
  // transition: 'Vue-Toastification__bounce',
  position: POSITION.BOTTOM_CENTER,
  draggable: false,
  pauseOnHover: true,
  timeout: 3000,
  hideProgressBar: true,
  toastClassName: 'app-toast',
  closeButton: null,
  icon: false,
  maxToasts: 20,
  newestOnTop: true,
} as const;

export const V_MONEY_OPTIONS = {
  precision: 0,
  thousands: ',',
  masked: true,
} as const;
