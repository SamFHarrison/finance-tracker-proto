"use client";

import { useQuery } from "@tanstack/react-query";
import { getIncome } from "@/lib/api/income";
import { qk } from "./queryKeys";

export function useGetIncome(budgetId: string | null | undefined) {
  return useQuery({
    queryKey: budgetId ? qk.income(budgetId) : ["income", "no-budget"],
    queryFn: () => getIncome(budgetId!),
    enabled: !!budgetId,
  });
}
