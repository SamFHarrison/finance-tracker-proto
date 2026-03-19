"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Button,
  Checkbox,
  FieldError,
  H3,
  P,
  TableCell,
  TableRow,
} from "@/components/ui";
import { CategorySelectOptions } from "@/lib/contants";
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
import ExpenseFormFields, {
  expenseFormSchema,
  type ExpenseFormValues,
} from "./expense-form-fields";

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
  const getDefaultValues = (): ExpenseFormValues => ({
    name: expense.name,
    amount: formatMinorUnitsForInput(expense.amount_pence),
    paymentDay: Number(expense.payment_date.slice(-2)),
    category: expense.category,
    isPaid: localIsPaid,
  });
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    setValue,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: getDefaultValues(),
  });
  const name = useWatch({ control, name: "name" }) ?? "";
  const amount = useWatch({ control, name: "amount" }) ?? "";
  const isPending =
    mutateExpense.isPending || deleteExpense.isPending || isSubmitting;
  const canSave = !isPending;
  const categoryLabel =
    CategorySelectOptions.find((option) => option.value === expense.category)
      ?.label ?? expense.category;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          reset(getDefaultValues());
          return;
        }

        clearErrors();
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
              onStillToPayDelta?.(deltaPence);

              mutateExpense.mutate(
                {
                  expenseId: expense.id,
                  patch: { is_paid: nextIsPaid },
                },
                {
                  onError: () => {
                    setLocalIsPaid(previousIsPaid);
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
          onSubmit={handleSubmit(async (values) => {
            clearErrors("root");

            const amountPence = parseCurrencyToMinorUnits(values.amount);
            if (amountPence === null) {
              setError("amount", {
                type: "validate",
                message: "Enter a valid amount.",
              });
              return;
            }

            try {
              await mutateExpense.mutateAsync({
                expenseId: expense.id,
                patch: {
                  name: values.name.trim(),
                  amount_pence: amountPence,
                  category: values.category,
                  payment_date: computePaymentDateForCycle({
                    periodStart,
                    monthStartDay,
                    paymentDay: values.paymentDay,
                  }),
                  is_paid: values.isPaid,
                },
              });
              setLocalIsPaid(values.isPaid);
              setOpen(false);
              router.refresh();
            } catch (error: unknown) {
              setError("root", {
                type: "server",
                message:
                  error instanceof Error
                    ? error.message
                    : "Unable to save expense.",
              });
            }
          })}
        >
          <ExpenseFormFields
            idPrefix={`expense-${expense.id}`}
            control={control}
            errors={errors}
            values={{ name, amount }}
            disabled={isPending}
            showIsPaidToggle
            onNameChange={(value) =>
              setValue("name", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            onAmountChange={(value) =>
              setValue("amount", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
          <FieldError>{errors.root?.message}</FieldError>

          <DialogFooter className="mt-4 flex-row">
            <Button
              type="button"
              variant="destructive"
              className="w-full shrink"
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
            <Button type="submit" className="w-full shrink" disabled={!canSave}>
              {mutateExpense.isPending && <Spinner />}
              {mutateExpense.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
