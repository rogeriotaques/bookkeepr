import { reactive, watch } from 'vue';

interface State {
  isAuthenticated: boolean;
  credential: string | null;
}

const CREDENTIAL_KEY = 'credential';

const store = reactive<State>({
  isAuthenticated: !!sessionStorage.getItem(CREDENTIAL_KEY),
  credential: sessionStorage.getItem(CREDENTIAL_KEY),
});

watch(
  () => store.credential,
  (val) => {
    if (val) {
      sessionStorage.setItem(CREDENTIAL_KEY, val);
      store.isAuthenticated = true;
    } else {
      sessionStorage.removeItem(CREDENTIAL_KEY);
      store.isAuthenticated = false;
    }
  }
);

export const useState = () => store;

export const logout = () => {
  store.credential = null;
};
