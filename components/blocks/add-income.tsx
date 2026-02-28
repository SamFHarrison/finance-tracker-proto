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
import { Button, Field, FieldGroup, Input, Label } from "../ui";
import { Switch } from "../ui/switch";
import { useCreateIncome } from "@/lib/hooks/useCreateIncome";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

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

            createIncome.mutate(
              {
                budget_id: budgetId,
                name,
                amount_pence: Number(amount),
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
                onChange={(e) => setName(e.target.value)}
                disabled={createIncome.isPending}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="income-amount">Amount</Label>
              <Input
                id="income-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={createIncome.isPending}
                required
              />
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
