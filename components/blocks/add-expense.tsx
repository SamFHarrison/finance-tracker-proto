"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useCreateExpense } from "@/lib/hooks/useCreateExpense";
import { computePaymentDateForCycle } from "@/lib/utils/calculateExpensePaymentDate";
import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import { Button, FieldError } from "../ui";
import { Spinner } from "../ui/spinner";
import ExpenseFormFields, {
  expenseFormSchema,
  type ExpenseFormValues,
} from "./expense-form-fields";

type AddExpenseFormProps = {
  budgetId: string;
  periodStart: string;
  monthStartDay: number;
};

const ADD_EXPENSE_DEFAULT_VALUES: ExpenseFormValues = {
  name: "",
  amount: "",
  paymentDay: 1,
  category: "essential",
  isPaid: false,
};

export default function AddExpenseForm({
  budgetId,
  periodStart,
  monthStartDay,
}: AddExpenseFormProps) {
  const router = useRouter();
  const createExpense = useCreateExpense(budgetId);
  const [open, setOpen] = useState(false);
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
    defaultValues: ADD_EXPENSE_DEFAULT_VALUES,
  });
  const name = useWatch({ control, name: "name" }) ?? "";
  const amount = useWatch({ control, name: "amount" }) ?? "";
  const isPending = createExpense.isPending || isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          clearErrors();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-lg">
            <Plus />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
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
              await createExpense.mutateAsync({
                budget_id: budgetId,
                name: values.name.trim(),
                amount_pence: amountPence,
                category: values.category,
                payment_date: computePaymentDateForCycle({
                  periodStart,
                  monthStartDay,
                  paymentDay: values.paymentDay,
                }),
                is_paid: false,
              });
              reset(ADD_EXPENSE_DEFAULT_VALUES);
              setOpen(false);
              router.refresh();
            } catch (error: unknown) {
              setError("root", {
                type: "server",
                message:
                  error instanceof Error
                    ? error.message
                    : "Unable to add expense.",
              });
            }
          })}
        >
          <ExpenseFormFields
            idPrefix="add-expense"
            control={control}
            errors={errors}
            values={{ name, amount }}
            disabled={isPending}
            amountRequired
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Spinner />}
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
