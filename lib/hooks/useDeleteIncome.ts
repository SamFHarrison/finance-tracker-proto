"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIncome } from "@/lib/api/income";
import { qk } from "./queryKeys";

export function useDeleteIncome(budgetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (incomeId: string) => deleteIncome(incomeId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.income(budgetId) });
      await qc.invalidateQueries({ queryKey: qk.budgetSummary(budgetId) });
    },
  });
}
