"use client";

import {
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
  dayOptions,
  ExpenseCategory,
} from "@/lib/contants";
import { Switch } from "../ui/switch";

type ExpenseFormFieldsProps = {
  idPrefix: string;
  name: string;
  amount: string;
  paymentDay: number;
  category: ExpenseCategory;
  disabled?: boolean;
  amountRequired?: boolean;
  isPaid?: boolean;
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onPaymentDayChange: (value: number) => void;
  onCategoryChange: (value: ExpenseCategory) => void;
  onIsPaidChange?: (value: boolean) => void;
};

export default function ExpenseFormFields({
  idPrefix,
  name,
  amount,
  paymentDay,
  category,
  disabled = false,
  amountRequired = false,
  isPaid,
  onNameChange,
  onAmountChange,
  onPaymentDayChange,
  onCategoryChange,
  onIsPaidChange,
}: ExpenseFormFieldsProps) {
  const nameId = `${idPrefix}-name`;
  const amountId = `${idPrefix}-amount`;
  const paymentDayId = `${idPrefix}-payment-day`;
  const categoryId = `${idPrefix}-category`;
  const isPaidId = `${idPrefix}-is-paid`;

  return (
    <FieldGroup>
      <Field>
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          name="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          required
        />
      </Field>

      <Field>
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
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled}
            required={amountRequired}
          />
        </InputGroup>
      </Field>

      <Field>
        <div>
          <Label className="flex-col items-start">
            Payment day
            <P isSubtext>
              If this day doesn&apos;t exist, we&apos;ll use the last day of the
              month.
            </P>
          </Label>
        </div>
        <Select
          items={dayOptions}
          value={paymentDay}
          onValueChange={(value) => onPaymentDayChange(Number(value))}
          disabled={disabled}
          required
        >
          <SelectTrigger id={paymentDayId} className="w-full max-w-48">
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
        <Label htmlFor={categoryId}>Category</Label>
        <Select
          items={CategorySelectOptions}
          value={category}
          onValueChange={(value) => onCategoryChange(value as ExpenseCategory)}
          disabled={disabled}
          required
        >
          <SelectTrigger id={categoryId} className="w-full max-w-48">
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

      {typeof isPaid === "boolean" && onIsPaidChange ? (
        <Field className="flex-row">
          <Label htmlFor={isPaidId}>Mark as paid</Label>
          <Switch
            id={isPaidId}
            checked={isPaid}
            onCheckedChange={onIsPaidChange}
            disabled={disabled}
          />
        </Field>
      ) : null}
    </FieldGroup>
  );
}
