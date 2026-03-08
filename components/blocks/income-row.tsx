"use client";

import { Button, H3, P, TableCell, TableRow } from "@/components/ui";
import { formatCurrencyFromMinorUnits } from "@/lib/utils/formatCurrencyMinorUnits";
import { IncomeRow } from "@/lib/supabase/types/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { useMutateIncome } from "@/lib/hooks/useMutateIncome";
import { useDeleteIncome } from "@/lib/hooks/useDeleteIncome";
import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import { formatMinorUnitsForInput } from "@/lib/utils/formatMinorUnitsForInput";
import IncomeFormFields from "./income-form-fields";
import { useRouter } from "next/navigation";

type IncomeTableRowProps = {
  income: IncomeRow;
  budgetId: string;
};

export default function IncomeTableRow({
  income,
  budgetId,
}: IncomeTableRowProps) {
  const router = useRouter();
  const mutateIncome = useMutateIncome(budgetId);
  const deleteIncome = useDeleteIncome(budgetId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(income.name);
  const [amount, setAmount] = useState(
    formatMinorUnitsForInput(income.amount_pence),
  );
  const [isMonthly, setIsMonthly] = useState(income.is_monthly);

  const isPending = mutateIncome.isPending || deleteIncome.isPending;

  const resetForm = () => {
    setName(income.name);
    setAmount(formatMinorUnitsForInput(income.amount_pence));
    setIsMonthly(income.is_monthly);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          resetForm();
        }
      }}
    >
      <TableRow>
        <TableCell colSpan={2} className="p-0">
          <DialogTrigger
            render={
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 p-2 text-left"
              />
            }
          >
            <div>
              <P>{income.name}</P>
              <P isSubtext>{income.is_monthly ? "Monthly" : "Additional"}</P>
            </div>
            <H3 className="tabular-nums">
              {formatCurrencyFromMinorUnits(income.amount_pence)}
            </H3>
          </DialogTrigger>
        </TableCell>
      </TableRow>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit income</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const amountPence = parseCurrencyToMinorUnits(amount);
            if (amountPence === null) return;

            mutateIncome.mutate(
              {
                incomeId: income.id,
                patch: {
                  name,
                  amount_pence: amountPence,
                  is_monthly: isMonthly,
                },
              },
              {
                onSuccess: () => {
                  setOpen(false);
                  router.refresh();
                },
              },
            );
          }}
        >
          <IncomeFormFields
            idPrefix={`income-${income.id}`}
            name={name}
            amount={amount}
            isMonthly={isMonthly}
            disabled={isPending}
            onNameChange={setName}
            onAmountChange={setAmount}
            onIsMonthlyChange={setIsMonthly}
          />

          <DialogFooter className="flex-row">
            <Button
              type="button"
              variant="destructive"
              className="w-full mt-4 shrink"
              disabled={isPending}
              onClick={() =>
                deleteIncome.mutate(income.id, {
                  onSuccess: () => {
                    setOpen(false);
                    router.refresh();
                  },
                })
              }
            >
              {deleteIncome.isPending && <Spinner />}
              {deleteIncome.isPending ? "Deleting..." : "Delete"}
            </Button>
            <Button
              type="submit"
              className="w-full mt-4 shrink"
              disabled={isPending}
            >
              {mutateIncome.isPending && <Spinner />}
              {mutateIncome.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
