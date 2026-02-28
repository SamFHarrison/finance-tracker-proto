"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus } from "lucide-react";
import { Button, Field, FieldGroup, Input, Label } from "../ui";
import { Switch } from "../ui/switch";
import { useCreateIncome } from "@/lib/hooks/useCreateIncome";
import { useState } from "react";

export default function AddIncomeForm({ budgetId }: { budgetId: string }) {
  const createIncome = useCreateIncome(budgetId);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isMonthly, setIsMonthly] = useState(false);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-lg">
            <Plus />
          </Button>
        }
      />
      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add income</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              createIncome.mutate({
                budget_id: budgetId,
                name,
                amount_pence: Number(amount),
                is_monthly: isMonthly,
              });
            }}
          >
            <FieldGroup>
              <Field>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </Field>

              <Field className="flex-row">
                <Label htmlFor="isMonthly">Add this income every month</Label>
                <Switch
                  id="isMonthly"
                  checked={isMonthly}
                  onCheckedChange={() => setIsMonthly(!isMonthly)}
                />
              </Field>
            </FieldGroup>

            <DialogFooter className="flex-row">
              <Button type="submit" className="w-full mt-4">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
