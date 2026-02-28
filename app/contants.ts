import { Constants, Database } from "@/lib/supabase/types/database";

export type ExpenseCategory = Database["public"]["Enums"]["expense_category"];

export type CategorySelectOption = {
  label: string;
  value: ExpenseCategory;
};

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  essential: "Essential",
  debt: "Debt",
  luxuries: "Luxuries",
  variable: "Variable",
  savings_and_investments: "Savings and Investments",
};

const EXPENSE_CATEGORIES = Constants.public.Enums
  .expense_category as readonly ExpenseCategory[];

export const CategorySelectOptions: CategorySelectOption[] =
  EXPENSE_CATEGORIES.map((value) => ({
    label: CATEGORY_LABELS[value],
    value,
  }));

const DAYS_1_TO_31 = Array.from({ length: 31 }, (_, i) => i + 1);
export const dayOptions = DAYS_1_TO_31.map((d) => ({
  label: String(d),
  value: d,
}));
