"use client";

import { Checkbox, H3, P, TableCell, TableRow } from "@/components/ui";
import { ExpenseRow } from "@/lib/supabase/types/types";
import { useMutateExpense } from "@/lib/hooks/useMutateExpense";
import { formatCurrencyFromMinorUnits } from "@/lib/utils/formatCurrencyMinorUnits";
import { formatDayOrdinal } from "@/lib/utils/formatDayOrdinal";

type ExpenseTableRowProps = {
  budgetId: string;
  expense: ExpenseRow;
};

export default function ExpenseTableRow({
  budgetId,
  expense,
}: ExpenseTableRowProps) {
  const mutateExpense = useMutateExpense(budgetId);

  return (
    <TableRow>
      <TableCell className="w-10">
        <Checkbox
          checked={expense.is_paid}
          onCheckedChange={() =>
            mutateExpense.mutate({
              expenseId: expense.id,
              patch: { is_paid: !expense.is_paid },
            })
          }
        />
      </TableCell>
      <TableCell>
        <P>{expense.name}</P>
        <P isSubtext>{formatDayOrdinal(expense.payment_date)}</P>
      </TableCell>
      <TableCell className="text-right">
        <H3>{formatCurrencyFromMinorUnits(expense.amount_pence)}</H3>
      </TableCell>
    </TableRow>
  );
}
