"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, type ExpenseInsert } from "@/lib/api/expenses";
import { qk } from "./queryKeys";

export function useCreateExpense(budgetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseInsert) => createExpense(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.expenses(budgetId) });
      await qc.invalidateQueries({ queryKey: qk.budgetSummary(budgetId) });
    },
  });
}
