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
import { useCreateIncome } from "@/lib/hooks/useCreateIncome";
import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import { Button, FieldError } from "../ui";
import { Spinner } from "../ui/spinner";
import IncomeFormFields, {
  incomeFormSchema,
  type IncomeFormValues,
} from "./income-form-fields";

const ADD_INCOME_DEFAULT_VALUES: IncomeFormValues = {
  name: "",
  amount: "",
  isMonthly: false,
};

export default function AddIncomeForm({ budgetId }: { budgetId: string }) {
  const router = useRouter();
  const createIncome = useCreateIncome(budgetId);
  const [open, setOpen] = useState(false);
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    setValue,
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: ADD_INCOME_DEFAULT_VALUES,
  });
  const name = useWatch({ control, name: "name" }) ?? "";
  const amount = useWatch({ control, name: "amount" }) ?? "";
  const isPending = createIncome.isPending || isSubmitting;

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
          <DialogTitle>Add income</DialogTitle>
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
              await createIncome.mutateAsync({
                budget_id: budgetId,
                name: values.name.trim(),
                amount_pence: amountPence,
                is_monthly: values.isMonthly,
              });
              reset(ADD_INCOME_DEFAULT_VALUES);
              setOpen(false);
              router.refresh();
            } catch (error: unknown) {
              setError("root", {
                type: "server",
                message:
                  error instanceof Error
                    ? error.message
                    : "Unable to add income.",
              });
            }
          })}
        >
          <IncomeFormFields
            idPrefix="add-income"
            control={control}
            errors={errors}
            values={{ name, amount }}
            disabled={isPending}
            namePlaceholder="Rent"
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
