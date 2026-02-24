"use client";

import { useQuery } from "@tanstack/react-query";
import { getExpenses } from "@/lib/api/expenses";
import { qk } from "./queryKeys";

export function useGetExpenses(budgetId: string | null | undefined) {
  return useQuery({
    queryKey: budgetId ? qk.expenses(budgetId) : ["expenses", "no-budget"],
    queryFn: () => getExpenses(budgetId!),
    enabled: !!budgetId,
  });
}
