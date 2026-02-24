import { createClient } from "@/lib/supabase/client";
import { Database } from "../supabase/types/database";

export type CurrentBudget =
  Database["public"]["Functions"]["get_or_create_budget"]["Returns"];

export async function getCurrentBudget(
  p_date?: string,
): Promise<CurrentBudget> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(
    "get_or_create_budget",
    p_date ? { p_date } : {},
  );
  if (error) throw error;
  return data;
}
