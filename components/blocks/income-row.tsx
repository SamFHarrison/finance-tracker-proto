"use client";

import {
  Button,
  Field,
  FieldGroup,
  H3,
  Input,
  Label,
  P,
  TableCell,
  TableRow,
} from "@/components/ui";
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
import { Switch } from "../ui/switch";
import { useMutateIncome } from "@/lib/hooks/useMutateIncome";
import { useDeleteIncome } from "@/lib/hooks/useDeleteIncome";

type IncomeTableRowProps = {
  income: IncomeRow;
  budgetId: string;
};

export default function IncomeTableRow({
  income,
  budgetId,
}: IncomeTableRowProps) {
  const mutateIncome = useMutateIncome(budgetId);
  const deleteIncome = useDeleteIncome(budgetId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(income.name);
  const [amount, setAmount] = useState(income.amount_pence);
  const [isMonthly, setIsMonthly] = useState(income.is_monthly);

  const isPending = mutateIncome.isPending || deleteIncome.isPending;

  const resetForm = () => {
    setName(income.name);
    setAmount(income.amount_pence);
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
            <H3>{formatCurrencyFromMinorUnits(income.amount_pence)}</H3>
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

            mutateIncome.mutate(
              {
                incomeId: income.id,
                patch: {
                  name,
                  amount_pence: Number(amount),
                  is_monthly: isMonthly,
                },
              },
              {
                onSuccess: () => {
                  setOpen(false);
                },
              },
            );
          }}
        >
          <FieldGroup>
            <Field>
              <Label htmlFor="income-name">Name</Label>
              <Input
                id="income-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="income-amount">Amount</Label>
              <Input
                id="income-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                disabled={isPending}
                required
              />
            </Field>

            <Field className="flex-row">
              <Label htmlFor="income-is-monthly">
                Add this income every month
              </Label>
              <Switch
                id="income-is-monthly"
                checked={isMonthly}
                onCheckedChange={() => setIsMonthly(!isMonthly)}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>

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
