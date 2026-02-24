import { createClient } from "../supabase/client";

export async function setNextMonthStartDay(p_new_start_day: number) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("set_month_start_day_next_cycle", {
    p_new_start_day,
  });
  if (error) throw error;
  return data;
}
