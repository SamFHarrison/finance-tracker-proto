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
} from "../ui";
import { Switch } from "../ui/switch";

type IncomeFormFieldsProps = {
  idPrefix: string;
  name: string;
  amount: string;
  isMonthly: boolean;
  disabled?: boolean;
  namePlaceholder?: string;
  amountRequired?: boolean;
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onIsMonthlyChange: (value: boolean) => void;
};

export default function IncomeFormFields({
  idPrefix,
  name,
  amount,
  isMonthly,
  disabled = false,
  namePlaceholder,
  amountRequired = false,
  onNameChange,
  onAmountChange,
  onIsMonthlyChange,
}: IncomeFormFieldsProps) {
  const nameId = `${idPrefix}-name`;
  const amountId = `${idPrefix}-amount`;
  const isMonthlyId = `${idPrefix}-is-monthly`;

  return (
    <FieldGroup>
      <Field>
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          name="name"
          value={name}
          placeholder={namePlaceholder}
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

      <Field className="flex-row">
        <Label htmlFor={isMonthlyId}>Add this income every month</Label>
        <Switch
          id={isMonthlyId}
          checked={isMonthly}
          onCheckedChange={onIsMonthlyChange}
          disabled={disabled}
        />
      </Field>
    </FieldGroup>
  );
}
