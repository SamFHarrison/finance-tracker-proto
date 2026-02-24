// lib/api/budgetSummary.ts
import { createClient } from "@/lib/supabase/client";
import { BudgetSummaryRow } from "../supabase/types/types";
import { BudgetSummary } from "../types/appTypes";

function toBudgetSummaryStrict(row: BudgetSummaryRow): BudgetSummary {
  if (!row.budget_id || !row.user_id || !row.period_start) {
    throw new Error("budget_summary row missing required identifiers");
  }

  // For your view, these coalesce() to 0 in SQL, but types still say null.
  return {
    ...row,
    budget_id: row.budget_id,
    user_id: row.user_id,
    period_start: row.period_start,

    income_total_pence: row.income_total_pence ?? 0,
    expense_total_pence: row.expense_total_pence ?? 0,
    still_to_pay_pence: row.still_to_pay_pence ?? 0,

    needs_pence: row.needs_pence ?? 0,
    wants_pence: row.wants_pence ?? 0,
    savings_pence: row.savings_pence ?? 0,

    needs_pct_of_income: row.needs_pct_of_income,
    wants_pct_of_income: row.wants_pct_of_income,
    savings_pct_of_income: row.savings_pct_of_income,
  };
}

export async function getBudgetSummary(
  budgetId: string,
): Promise<BudgetSummary> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("budget_summary")
    .select("*")
    .eq("budget_id", budgetId)
    .single();

  if (error) throw error;
  return toBudgetSummaryStrict(data);
}
