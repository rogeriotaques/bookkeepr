import { reactive } from 'vue';

interface State {
  isAuthenticated: boolean;
  credential: string | null;
}

const store = reactive<State>({
  isAuthenticated: false,
  credential: null,
});

export const useState = () => store;
