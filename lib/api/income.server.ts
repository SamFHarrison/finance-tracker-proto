import "server-only";

import { createClient } from "@/lib/supabase/server";
import { IncomeRow } from "../supabase/types/types";

export async function getIncome(budgetId: string): Promise<IncomeRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("income")
    .select("*")
    .eq("budget_id", budgetId)
    .order("amount_pence", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
