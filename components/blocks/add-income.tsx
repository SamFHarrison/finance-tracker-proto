"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus } from "lucide-react";
import {
  Button,
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
import { useCreateIncome } from "@/lib/hooks/useCreateIncome";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";

export default function AddIncomeForm({ budgetId }: { budgetId: string }) {
  const createIncome = useCreateIncome(budgetId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isMonthly, setIsMonthly] = useState(false);

  const resetForm = () => {
    setName("");
    setAmount("");
    setIsMonthly(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          onSubmit={(e) => {
            e.preventDefault();

            const amountPence = parseCurrencyToMinorUnits(amount);
            if (amountPence === null) return;

            createIncome.mutate(
              {
                budget_id: budgetId,
                name,
                amount_pence: amountPence,
                is_monthly: isMonthly,
              },
              {
                onSuccess: () => {
                  resetForm();
                  setOpen(false);
                },
              },
            );
          }}
        >
          <FieldGroup>
            <Field>
              <Label htmlFor="income-name">Name</Label>
              <Input
                id="income-name"
                name="name"
                value={name}
                placeholder="Rent"
                onChange={(e) => setName(e.target.value)}
                disabled={createIncome.isPending}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="income-amount">Amount</Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText className="text-base font-normal">
                    £
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="income-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={createIncome.isPending}
                  required
                />
              </InputGroup>
            </Field>

            <Field className="flex-row">
              <Label htmlFor="income-is-monthly">
                Add this income every month
              </Label>
              <Switch
                id="income-is-monthly"
                checked={isMonthly}
                onCheckedChange={() => setIsMonthly(!isMonthly)}
                disabled={createIncome.isPending}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="flex-row">
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={createIncome.isPending}
            >
              {createIncome.isPending && <Spinner />}
              {createIncome.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
