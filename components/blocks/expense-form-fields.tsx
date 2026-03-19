"use client";

import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import {
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { z } from "zod";
import {
  FieldError,
  Field,
  FieldGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Label,
  P,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui";
import {
  CategorySelectOptions,
  EXPENSE_CATEGORIES,
  dayOptions,
  ExpenseCategory,
} from "@/lib/contants";
import { Switch } from "../ui/switch";

export const expenseFormSchema = z.object({
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
  paymentDay: z.number().int().min(1).max(31),
  category: z.custom<ExpenseCategory>(
    (value) =>
      typeof value === "string" &&
      EXPENSE_CATEGORIES.includes(value as ExpenseCategory),
    "Select a category.",
  ),
  isPaid: z.boolean(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

type ExpenseFormFieldsProps = {
  idPrefix: string;
  control: Control<ExpenseFormValues>;
  errors: FieldErrors<ExpenseFormValues>;
  values: Pick<ExpenseFormValues, "name" | "amount">;
  disabled?: boolean;
  amountRequired?: boolean;
  showIsPaidToggle?: boolean;
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
};

export default function ExpenseFormFields({
  idPrefix,
  control,
  errors,
  values,
  disabled = false,
  amountRequired = false,
  showIsPaidToggle = false,
  onNameChange,
  onAmountChange,
}: ExpenseFormFieldsProps) {
  const nameId = `${idPrefix}-name`;
  const amountId = `${idPrefix}-amount`;
  const paymentDayId = `${idPrefix}-payment-day`;
  const categoryId = `${idPrefix}-category`;
  const isPaidId = `${idPrefix}-is-paid`;

  return (
    <FieldGroup>
      <Field data-invalid={!!errors.name}>
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          name="name"
          value={values.name}
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
        name="paymentDay"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div>
              <Label className="flex-col items-start">
                Payment day
                <P isSubtext>
                  If the month is shorter than this day, it&apos;ll default to
                  last day of the month.
                </P>
              </Label>
            </div>
            <Select
              items={dayOptions}
              value={field.value}
              onValueChange={(value) => {
                const nextDay = Number(value);
                if (!Number.isFinite(nextDay)) return;
                field.onChange(nextDay);
              }}
              disabled={disabled}
              required
            >
              <SelectTrigger
                id={paymentDayId}
                className="w-full max-w-48"
                aria-invalid={fieldState.invalid ? true : undefined}
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
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="category"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Label htmlFor={categoryId}>Category</Label>
            <Select
              items={CategorySelectOptions}
              value={field.value}
              onValueChange={(value) =>
                field.onChange(value as ExpenseCategory)
              }
              disabled={disabled}
              required
            >
              <SelectTrigger
                id={categoryId}
                className="w-full max-w-48"
                aria-invalid={fieldState.invalid ? true : undefined}
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
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {showIsPaidToggle ? (
        <Controller
          name="isPaid"
          control={control}
          render={({ field }) => (
            <Field className="flex-row">
              <Label htmlFor={isPaidId}>Mark as paid</Label>
              <Switch
                id={isPaidId}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </Field>
          )}
        />
      ) : null}
    </FieldGroup>
  );
}
