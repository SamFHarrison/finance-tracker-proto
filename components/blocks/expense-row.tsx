"use client";

import { useState } from "react";
import { Button, Checkbox, H3, P, TableCell, TableRow } from "@/components/ui";
import { CategorySelectOptions, ExpenseCategory } from "@/lib/contants";
import { useDeleteExpense } from "@/lib/hooks/useDeleteExpense";
import { ExpenseRow } from "@/lib/supabase/types/types";
import { useMutateExpense } from "@/lib/hooks/useMutateExpense";
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
import { useRouter } from "next/navigation";

type ExpenseTableRowProps = {
  budgetId: string;
  expense: ExpenseRow;
  periodStart: string;
  monthStartDay: number;
  onStillToPayDelta?: (deltaPence: number) => void;
};

export default function ExpenseTableRow({
  budgetId,
  expense,
  periodStart,
  monthStartDay,
  onStillToPayDelta,
}: ExpenseTableRowProps) {
  const router = useRouter();

  const mutateExpense = useMutateExpense(budgetId);
  const deleteExpense = useDeleteExpense(budgetId);

  const [open, setOpen] = useState(false);
  const [localIsPaid, setLocalIsPaid] = useState(expense.is_paid);
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
  const canSave = !isPending;
  const categoryLabel =
    CategorySelectOptions.find((option) => option.value === expense.category)
      ?.label ?? expense.category;

  const resetForm = () => {
    setName(expense.name);
    setAmount(formatMinorUnitsForInput(expense.amount_pence));
    setPaymentDay(Number(expense.payment_date.slice(-2)));
    setCategory(expense.category);
    setIsPaid(localIsPaid);
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
            checked={localIsPaid}
            disabled={isPending}
            onCheckedChange={() => {
              const previousIsPaid = localIsPaid;
              const nextIsPaid = !previousIsPaid;
              const deltaPence = nextIsPaid
                ? -expense.amount_pence
                : expense.amount_pence;

              setLocalIsPaid(nextIsPaid);
              setIsPaid(nextIsPaid);
              onStillToPayDelta?.(deltaPence);

              mutateExpense.mutate(
                {
                  expenseId: expense.id,
                  patch: { is_paid: nextIsPaid },
                },
                {
                  onError: () => {
                    setLocalIsPaid(previousIsPaid);
                    setIsPaid(previousIsPaid);
                    onStillToPayDelta?.(-deltaPence);
                  },
                  onSettled: () => {
                    router.refresh();
                  },
                },
              );
            }}
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
            <H3 className="tabular-nums">
              {formatCurrencyFromMinorUnits(expense.amount_pence)}
            </H3>
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
                    periodStart,
                    monthStartDay,
                    paymentDay,
                  }),
                  is_paid: isPaid,
                },
              },
              {
                onSuccess: () => {
                  setLocalIsPaid(isPaid);
                  setOpen(false);
                  router.refresh();
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
                    router.refresh();
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
