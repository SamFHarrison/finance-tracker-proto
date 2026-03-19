"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Button,
  FieldError,
  H3,
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
import { useDeleteIncome } from "@/lib/hooks/useDeleteIncome";
import { useMutateIncome } from "@/lib/hooks/useMutateIncome";
import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import { formatMinorUnitsForInput } from "@/lib/utils/formatMinorUnitsForInput";
import { Spinner } from "../ui/spinner";
import IncomeFormFields, {
  incomeFormSchema,
  type IncomeFormValues,
} from "./income-form-fields";

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
  const getDefaultValues = (): IncomeFormValues => ({
    name: income.name,
    amount: formatMinorUnitsForInput(income.amount_pence),
    isMonthly: income.is_monthly,
  });
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
    defaultValues: getDefaultValues(),
  });
  const name = useWatch({ control, name: "name" }) ?? "";
  const amount = useWatch({ control, name: "amount" }) ?? "";
  const isPending =
    mutateIncome.isPending || deleteIncome.isPending || isSubmitting;

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
              await mutateIncome.mutateAsync({
                incomeId: income.id,
                patch: {
                  name: values.name.trim(),
                  amount_pence: amountPence,
                  is_monthly: values.isMonthly,
                },
              });
              setOpen(false);
              router.refresh();
            } catch (error: unknown) {
              setError("root", {
                type: "server",
                message:
                  error instanceof Error
                    ? error.message
                    : "Unable to save income.",
              });
            }
          })}
        >
          <IncomeFormFields
            idPrefix={`income-${income.id}`}
            control={control}
            errors={errors}
            values={{ name, amount }}
            disabled={isPending}
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
              className="w-full shrink"
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
