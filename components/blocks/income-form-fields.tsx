"use client";

import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Label,
} from "../ui";
import { Switch } from "../ui/switch";

export const incomeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required.")
    .refine(
      (value) => parseCurrencyToMinorUnits(value) !== null,
      "Enter a valid amount.",
    )
    .refine((value) => {
      const amount = parseCurrencyToMinorUnits(value);
      return amount === null ? true : amount >= 0;
    }, "Amount must be zero or more."),
  isMonthly: z.boolean(),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;

type IncomeFormFieldsProps = {
  idPrefix: string;
  control: Control<IncomeFormValues>;
  errors: FieldErrors<IncomeFormValues>;
  values: Pick<IncomeFormValues, "name" | "amount">;
  disabled?: boolean;
  namePlaceholder?: string;
  amountRequired?: boolean;
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
};

export default function IncomeFormFields({
  idPrefix,
  control,
  errors,
  values,
  disabled = false,
  namePlaceholder,
  amountRequired = false,
  onNameChange,
  onAmountChange,
}: IncomeFormFieldsProps) {
  const nameId = `${idPrefix}-name`;
  const amountId = `${idPrefix}-amount`;
  const isMonthlyId = `${idPrefix}-is-monthly`;

  return (
    <FieldGroup>
      <Field data-invalid={!!errors.name}>
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          name="name"
          value={values.name}
          placeholder={namePlaceholder}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          required
          aria-invalid={errors.name ? true : undefined}
        />
        <FieldError errors={[errors.name]} />
      </Field>

      <Field data-invalid={!!errors.amount}>
        <Label htmlFor={amountId}>Amount</Label>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText className="text-base font-normal">£</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id={amountId}
            name="amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            value={values.amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled}
            required={amountRequired}
            aria-invalid={errors.amount ? true : undefined}
          />
        </InputGroup>
        <FieldError errors={[errors.amount]} />
      </Field>

      <Controller
        name="isMonthly"
        control={control}
        render={({ field }) => (
          <Field className="flex-row">
            <Label htmlFor={isMonthlyId}>Add this income every month</Label>
            <Switch
              id={isMonthlyId}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
