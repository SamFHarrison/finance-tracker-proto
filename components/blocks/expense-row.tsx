"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Field,
  FieldGroup,
  H3,
  Input,
  Label,
  P,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  TableCell,
  TableRow,
} from "@/components/ui";
import {
  CategorySelectOptions,
  dayOptions,
  ExpenseCategory,
} from "@/app/contants";
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
import { Switch } from "../ui/switch";

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
  const [amount, setAmount] = useState(String(expense.amount_pence));
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
    setAmount(String(expense.amount_pence));
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

            mutateExpense.mutate(
              {
                expenseId: expense.id,
                patch: {
                  name,
                  amount_pence: Number(amount),
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
          <FieldGroup>
            <Field>
              <Label htmlFor="expense-name">Name</Label>
              <Input
                id="expense-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending}
                required
              />
            </Field>

            <Field>
              <div>
                <Label className="flex-col items-start">
                  Payment day
                  <P isSubtext>
                    If this day doesn&apos;t exist, we&apos;ll use the last day
                    of the month.
                  </P>
                </Label>
              </div>
              <Select
                items={dayOptions}
                value={paymentDay}
                onValueChange={(value) => setPaymentDay(Number(value))}
                disabled={isPending}
                required
              >
                <SelectTrigger
                  id="expense-payment-day"
                  className="w-full max-w-48"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Days of the month</SelectLabel>
                    {dayOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="expense-category">Category</Label>
              <Select
                items={CategorySelectOptions}
                value={category}
                onValueChange={(value) => setCategory(value as ExpenseCategory)}
                disabled={isPending}
                required
              >
                <SelectTrigger
                  id="expense-category"
                  className="w-full max-w-48"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {CategorySelectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="flex-row">
              <Label htmlFor="expense-is-paid">Mark as paid</Label>
              <Switch
                id="expense-is-paid"
                checked={isPaid}
                onCheckedChange={() => setIsPaid(!isPaid)}
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
