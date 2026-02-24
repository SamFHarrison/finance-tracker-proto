import { BudgetSummaryRow } from "../supabase/types/types";

export type BudgetSummary = Omit<
  BudgetSummaryRow,
  | "budget_id"
  | "user_id"
  | "period_start"
  | "income_total_pence"
  | "expense_total_pence"
  | "still_to_pay_pence"
  | "needs_pence"
  | "wants_pence"
  | "savings_pence"
  | "needs_pct_of_income"
  | "wants_pct_of_income"
  | "savings_pct_of_income"
> & {
  budget_id: string;
  user_id: string;
  period_start: string;

  income_total_pence: number;
  expense_total_pence: number;
  still_to_pay_pence: number;

  needs_pence: number;
  wants_pence: number;
  savings_pence: number;

  needs_pct_of_income: number | null;
  wants_pct_of_income: number | null;
  savings_pct_of_income: number | null;
};
