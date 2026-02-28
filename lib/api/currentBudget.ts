import { createClient } from "@/lib/supabase/client";
import { CurrentBudget, CurrentBudgetReturn } from "../types/appTypes";

function toCurrentBudgetStrict(
  data: CurrentBudgetReturn | null,
): CurrentBudget {
  if (!data?.id || !data.user_id || !data.period_start) {
    throw new Error("current_budget result missing required identifiers");
  }

  return {
    ...data,
    id: data.id,
    user_id: data.user_id,
    period_start: data.period_start,
  };
}

export async function getCurrentBudget(
  p_date?: string,
): Promise<CurrentBudget> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(
    "get_or_create_budget",
    p_date ? { p_date } : {},
  );
  if (error) throw error;
  return toCurrentBudgetStrict(data);
}
