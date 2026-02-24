import { createClient } from "@/lib/supabase/client";
import { ExpensePatch, ExpenseRow } from "../supabase/types/types";
import {
  compactUndefined,
  WithUndefined,
} from "../supabase/types/type-helpers";
import { TablesInsert } from "../supabase/types/database";

export type ExpenseInsert = TablesInsert<"expenses">;
export type ExpensePatchInput = WithUndefined<ExpensePatch>;

export async function getExpenses(budgetId: string): Promise<ExpenseRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("budget_id", budgetId)
    .order("payment_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createExpense(input: ExpenseInsert): Promise<ExpenseRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);
  if (error) throw error;
}

export async function mutateExpense(
  expenseId: string,
  patch: ExpensePatchInput,
): Promise<ExpenseRow> {
  const supabase = createClient();
  const update = compactUndefined(patch);

  if (Object.keys(update).length === 0)
    throw new Error("No fields provided to update.");

  const { data, error } = await supabase
    .from("expenses")
    .update(update)
    .eq("id", expenseId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
