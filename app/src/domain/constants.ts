import { POSITION } from 'vue-toastification';

export const BASE_URL = 'http://localhost:8083/api';

export const ENTRY_OPERATIONS = {
  INCOME: 'income',
  EXPENSE: 'outcome',
} as const;

export const TOAST_BASE_SETTINGS = {
  // transition: 'Vue-Toastification__bounce',
  position: POSITION.TOP_CENTER,
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
