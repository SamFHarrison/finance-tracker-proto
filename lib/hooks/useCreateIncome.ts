"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncome, type IncomeInsert } from "@/lib/api/income";
import { qk } from "./queryKeys";

export function useCreateIncome(budgetId: string) {
  return useMutation({
    mutationFn: (input: IncomeInsert) => createIncome(input),
    onSuccess: async () => {
      const qc = useQueryClient();

      await qc.invalidateQueries({ queryKey: qk.income(budgetId) });
      await qc.invalidateQueries({ queryKey: qk.budgetSummary(budgetId) });
    },
  });
}
