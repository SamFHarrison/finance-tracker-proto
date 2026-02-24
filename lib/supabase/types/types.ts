import { Tables, TablesUpdate } from "./database";

// Rows
export type ExpenseRow = Tables<"expenses">;
export type IncomeRow = Tables<"income">;
export type ProfileRow = Tables<"profiles">;
export type BudgetSummaryRow = Tables<"budget_summary">; // view row via Tables<> helper

// Updates
export type ExpenseUpdate = TablesUpdate<"expenses">;
export type IncomeUpdate = TablesUpdate<"income">;
export type ProfileUpdate = TablesUpdate<"profiles">;

// Patches: derived from Update, but disallow immutable/sensitive columns
export type ExpensePatch = Omit<
  ExpenseUpdate,
  "id" | "budget_id" | "created_at"
>;
export type IncomePatch = Omit<IncomeUpdate, "id" | "budget_id" | "created_at">;
export type ProfilePatch = Omit<
  ProfileUpdate,
  | "user_id"
  | "created_at"
  | "updated_at"
  | "current_period_start"
  | "next_month_start_day"
>;
