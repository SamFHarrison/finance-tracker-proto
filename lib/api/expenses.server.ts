import "server-only";

import { createClient } from "@/lib/supabase/server";
import { ExpenseRow } from "../supabase/types/types";

export async function getExpenses(budgetId: string): Promise<ExpenseRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("budget_id", budgetId)
    .order("payment_date", { ascending: true })
    .order("amount_pence", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
