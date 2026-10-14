import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { fetchBudget, createBudget, updateBudget } from '@/domain/network';
import { Budget, BudgetItem } from '@/domain/interfaces.budget';

const BUDGET_KEY = 'budget';

export interface BudgetCache {
  year: number;
  month: number;
  budget: Budget | null;
  items: BudgetItem[];
}

export function useBudget(year: MaybeRefOrGetter<number>, month: MaybeRefOrGetter<number>) {
  const { isLoading, data } = useQuery({
    queryKey: computed(() => [BUDGET_KEY, toValue(year), toValue(month)]),
    queryFn: async () => {
      const y = toValue(year);
      const m = toValue(month);
      const res = await fetchBudget(y, m);
      return {
        year: y,
        month: m,
        budget: (res.budget as Budget | null) ?? null,
        items: (res.items as BudgetItem[]) ?? [],
      };
    },
  });

  const budget = computed(() => data.value?.budget ?? null);
  const items = computed(() => data.value?.items ?? []);

  const expenseBudgetTotal = computed(() =>
    items.value
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
  );

  const incomeBudgetTotal = computed(() =>
    items.value
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)
  );

  return {
    budget,
    items,
    queryData: data,
    expenseBudgetTotal,
    incomeBudgetTotal,
    isLoading,
  };
}

export function useSaveBudget() {
  const queryClient = useQueryClient();
  const isSaving = ref(false);

  const { mutateAsync: saveBudget } = useMutation({
    mutationFn: async (payload: {
      id?: number;
      year: number;
      month: number;
      goal: string;
      items: BudgetItem[];
    }) => {
      isSaving.value = true;
      try {
        if (payload.id) {
          return updateBudget(payload.id, {
            goal: payload.goal,
            items: payload.items,
          });
        } else {
          return createBudget({
            year: payload.year,
            month: payload.month,
            goal: payload.goal,
            items: payload.items,
          });
        }
      } finally {
        isSaving.value = false;
      }
    },
    onSuccess: (data, variables) => {
      const key = [BUDGET_KEY, variables.year, variables.month];
      const cached = queryClient.getQueryData(key) as BudgetCache | undefined;
      const created = (data as { budget?: Budget } | undefined)?.budget;
      const budget =
        created ??
        (cached?.budget ? { ...cached.budget, goal: variables.goal } : null);

      queryClient.setQueryData(key, {
        year: variables.year,
        month: variables.month,
        budget,
        items: variables.items,
      });
    },
  });

  return {
    saveBudget,
    isSaving,
  };
}
