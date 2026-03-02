"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  H3,
  P,
  TableCell,
  TableRow,
} from "@/components/ui";
import { CategorySelectOptions, ExpenseCategory } from "@/app/contants";
import { useCurrentBudget } from "@/lib/hooks/useCurrentBudget";
import { useDeleteExpense } from "@/lib/hooks/useDeleteExpense";
import { useGetProfile } from "@/lib/hooks/useGetProfile";
import { ExpenseRow } from "@/lib/supabase/types/types";
import { useMutateExpense } from "@/lib/hooks/useMutateExpense";
import { useUserId } from "@/lib/hooks/useUserId";
import { computePaymentDateForCycle } from "@/lib/utils/calculateExpensePaymentDate";
import { formatCurrencyFromMinorUnits } from "@/lib/utils/formatCurrencyMinorUnits";
import { formatDayOrdinal } from "@/lib/utils/formatDayOrdinal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Spinner } from "../ui/spinner";
import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import { formatMinorUnitsForInput } from "@/lib/utils/formatMinorUnitsForInput";
import ExpenseFormFields from "./expense-form-fields";

type ExpenseTableRowProps = {
  budgetId: string;
  expense: ExpenseRow;
};

export default function ExpenseTableRow({
  budgetId,
  expense,
}: ExpenseTableRowProps) {
  const { data: budget } = useCurrentBudget();
  const { data: userId } = useUserId();
  const { data: profile } = useGetProfile(userId);

  const mutateExpense = useMutateExpense(budgetId);
  const deleteExpense = useDeleteExpense(budgetId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(
    formatMinorUnitsForInput(expense.amount_pence),
  );
  const [paymentDay, setPaymentDay] = useState(
    Number(expense.payment_date.slice(-2)),
  );
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [isPaid, setIsPaid] = useState(expense.is_paid);

  const isPending = mutateExpense.isPending || deleteExpense.isPending;
  const canSave = !isPending && Boolean(budget) && Boolean(profile);
  const categoryLabel =
    CategorySelectOptions.find((option) => option.value === expense.category)
      ?.label ?? expense.category;

  const resetForm = () => {
    setName(expense.name);
    setAmount(formatMinorUnitsForInput(expense.amount_pence));
    setPaymentDay(Number(expense.payment_date.slice(-2)));
    setCategory(expense.category);
    setIsPaid(expense.is_paid);
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
        <TableCell className="w-10">
          <Checkbox
            checked={expense.is_paid}
            disabled={isPending}
            onCheckedChange={() =>
              mutateExpense.mutate({
                expenseId: expense.id,
                patch: { is_paid: !expense.is_paid },
              })
            }
          />
        </TableCell>
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
              <P>{expense.name}</P>
              <P isSubtext>
                {formatDayOrdinal(expense.payment_date)} {"\u2022"}{" "}
                {categoryLabel}
              </P>
            </div>
            <H3>{formatCurrencyFromMinorUnits(expense.amount_pence)}</H3>
          </DialogTrigger>
        </TableCell>
      </TableRow>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!budget || !profile) return;
            const amountPence = parseCurrencyToMinorUnits(amount);
            if (amountPence === null) return;

            mutateExpense.mutate(
              {
                expenseId: expense.id,
                patch: {
                  name,
                  amount_pence: amountPence,
                  category,
                  payment_date: computePaymentDateForCycle({
                    periodStart: budget.period_start,
                    monthStartDay: profile.month_start_day,
                    paymentDay,
                  }),
                  is_paid: isPaid,
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
          <ExpenseFormFields
            idPrefix={`expense-${expense.id}`}
            name={name}
            amount={amount}
            paymentDay={paymentDay}
            category={category}
            isPaid={isPaid}
            disabled={isPending}
            onNameChange={setName}
            onAmountChange={setAmount}
            onPaymentDayChange={setPaymentDay}
            onCategoryChange={setCategory}
            onIsPaidChange={setIsPaid}
          />

          <DialogFooter className="flex-row">
            <Button
              type="button"
              variant="destructive"
              className="w-full mt-4 shrink"
              disabled={isPending}
              onClick={() =>
                deleteExpense.mutate(expense.id, {
                  onSuccess: () => {
                    setOpen(false);
                  },
                })
              }
            >
              {deleteExpense.isPending && <Spinner />}
              {deleteExpense.isPending ? "Deleting..." : "Delete"}
            </Button>
            <Button
              type="submit"
              className="w-full mt-4 shrink"
              disabled={!canSave}
            >
              {mutateExpense.isPending && <Spinner />}
              {mutateExpense.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
