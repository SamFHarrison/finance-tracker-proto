import { createClient } from "@/lib/supabase/client";
import {
  compactUndefined,
  WithUndefined,
} from "../supabase/types/type-helpers";
import { IncomePatch, IncomeRow } from "../supabase/types/types";
import { TablesInsert } from "../supabase/types/database";

export type IncomeInsert = TablesInsert<"income">;
export type IncomePatchInput = WithUndefined<IncomePatch>;

export async function getIncome(budgetId: string): Promise<IncomeRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("income")
    .select("*")
    .eq("budget_id", budgetId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createIncome(input: IncomeInsert): Promise<IncomeRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("income")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIncome(incomeId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("income").delete().eq("id", incomeId);
  if (error) throw error;
}

export async function mutateIncome(
  incomeId: string,
  patch: IncomePatchInput,
): Promise<IncomeRow> {
  const supabase = createClient();
  const update = compactUndefined(patch);

  if (Object.keys(update).length === 0)
    throw new Error("No fields provided to update.");

  const { data, error } = await supabase
    .from("income")
    .update(update)
    .eq("id", incomeId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
