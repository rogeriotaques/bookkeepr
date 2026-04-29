import { computed, ref } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { fetchBudget, createBudget, updateBudget } from '@/domain/network';
import { Budget, BudgetItem } from '@/domain/interfaces.budget';

const BUDGET_KEY = 'budget';

export function useBudget(year: number, month: number) {
  const { isLoading, data } = useQuery({
    queryKey: [BUDGET_KEY, year, month],
    queryFn: async () => {
      const res = await fetchBudget(year, month);
      return res.data as { budget: Budget | null; items: BudgetItem[] };
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
    expenseBudgetTotal,
    incomeBudgetTotal,
    isLoading,
  };
}

export function useSaveBudget() {
  const queryClient = useQueryClient();
  const isSaving = ref(false);

  const { mutate: saveBudget } = useMutation({
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
          const res = await updateBudget(payload.id, {
            goal: payload.goal,
            items: payload.items,
          });
          return res.data;
        } else {
          const res = await createBudget({
            year: payload.year,
            month: payload.month,
            goal: payload.goal,
            items: payload.items,
          });
          return res.data;
        }
      } finally {
        isSaving.value = false;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [BUDGET_KEY, variables.year, variables.month],
      });
    },
  });

  return {
    saveBudget,
    isSaving,
  };
}
