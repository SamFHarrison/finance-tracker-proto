"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateIncome, type IncomePatchInput } from "@/lib/api/income";
import { qk } from "./queryKeys";

export function useMutateIncome(budgetId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { incomeId: string; patch: IncomePatchInput }) =>
      mutateIncome(vars.incomeId, vars.patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.income(budgetId) });
      await qc.invalidateQueries({ queryKey: qk.budgetSummary(budgetId) });
    },
  });
}
