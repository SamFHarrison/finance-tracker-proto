"use client";

import { H3, P, TableCell, TableRow } from "@/components/ui";
import { formatCurrencyFromMinorUnits } from "@/lib/utils/formatCurrencyMinorUnits";
import { IncomeRow } from "@/lib/supabase/types/types";

type IncomeTableRowProps = {
  income: IncomeRow;
};

export default function IncomeTableRow({ income }: IncomeTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <P>{income.name}</P>
        <P isSubtext>{income.is_monthly ? "Monthly" : "Additional"}</P>
      </TableCell>
      <TableCell className="text-right">
        <H3>{formatCurrencyFromMinorUnits(income.amount_pence)}</H3>
      </TableCell>
    </TableRow>
  );
}
