"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateExpense, type ExpensePatchInput } from "@/lib/api/expenses";
import { qk } from "./queryKeys";
import { ExpenseRow } from "../supabase/types/types";
import { BudgetSummary } from "../types/appTypes";

export function useMutateExpense(budgetId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { expenseId: string; patch: ExpensePatchInput }) =>
      mutateExpense(vars.expenseId, vars.patch),

    onMutate: async ({ expenseId, patch }) => {
      await qc.cancelQueries({ queryKey: qk.expenses(budgetId) });
      await qc.cancelQueries({ queryKey: qk.budgetSummary(budgetId) });

      const prevExpenses = qc.getQueryData<ExpenseRow[]>(qk.expenses(budgetId));
      const prevSummary = qc.getQueryData<BudgetSummary>(
        qk.budgetSummary(budgetId),
      );

      // Find current row to compute delta for still_to_pay
      const current = prevExpenses?.find((e) => e.id === expenseId);

      // Optimistically update expenses list
      if (prevExpenses) {
        qc.setQueryData<ExpenseRow[]>(qk.expenses(budgetId), (old = []) =>
          old.map((e) =>
            e.id === expenseId ? ({ ...e, ...patch } as ExpenseRow) : e,
          ),
        );
      }

      // If toggling is_paid, optimistically update still_to_pay
      if (prevSummary && current && patch.is_paid !== undefined) {
        const wasPaid = current.is_paid;
        const willBePaid = patch.is_paid;

        if (wasPaid !== willBePaid) {
          const delta = current.amount_pence; // affects still_to_pay only
          const nextStillToPay = willBePaid
            ? prevSummary.still_to_pay_pence - delta
            : prevSummary.still_to_pay_pence + delta;

          qc.setQueryData<BudgetSummary>(qk.budgetSummary(budgetId), {
            ...prevSummary,
            still_to_pay_pence: Math.max(0, nextStillToPay),
          });
        }
      }

      return { prevExpenses, prevSummary };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevExpenses)
        qc.setQueryData(qk.expenses(budgetId), ctx.prevExpenses);
      if (ctx?.prevSummary)
        qc.setQueryData(qk.budgetSummary(budgetId), ctx.prevSummary);
    },

    onSettled: async () => {
      // Ensure server truth wins (especially if other fields were edited)
      await qc.invalidateQueries({ queryKey: qk.expenses(budgetId) });
      await qc.invalidateQueries({ queryKey: qk.budgetSummary(budgetId) });
    },
  });
}
