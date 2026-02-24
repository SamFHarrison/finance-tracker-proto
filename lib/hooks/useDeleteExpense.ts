"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExpense } from "@/lib/api/expenses";
import { qk } from "./queryKeys";

export function useDeleteExpense(budgetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(expenseId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.expenses(budgetId) });
      await qc.invalidateQueries({ queryKey: qk.budgetSummary(budgetId) });
    },
  });
}
