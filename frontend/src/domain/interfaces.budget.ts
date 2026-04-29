export interface Budget {
  id: number;
  year: number;
  month: number;
  goal: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id?: number;
  budget_id?: number;
  type: 'income' | 'expense';
  label: string;
  group_code: number | null;
  amount: number;
  expense_type: 'fixed' | 'variable' | null;
  sort_order: number;
}

export interface BudgetWithItems {
  budget: Budget | null;
  items: BudgetItem[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  budgetTotal: number;
  actualTotal: number;
  progress: number;
  breakdown: {
    group_code: number;
    label: string;
    budget: number;
    actual: number;
    expense_type: string | null;
  }[];
}
