"use client";

import { useQuery } from "@tanstack/react-query";
import { getBudgetSummary } from "@/lib/api/budgetSummary";
import { qk } from "./queryKeys";

export function useGetBudgetSummary(budgetId: string | null | undefined) {
  return useQuery({
    queryKey: budgetId
      ? qk.budgetSummary(budgetId)
      : ["budgetSummary", "no-budget"],
    queryFn: () => getBudgetSummary(budgetId!),
    enabled: !!budgetId,
  });
}
