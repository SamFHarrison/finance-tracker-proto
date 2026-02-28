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
import {
  Button,
  Field,
  FieldGroup,
  Input,
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
import { useCreateExpense } from "@/lib/hooks/useCreateExpense";
import { useState } from "react";
import {
  CategorySelectOptions,
  dayOptions,
  ExpenseCategory,
} from "@/app/contants";
import { computePaymentDateForCycle } from "@/lib/utils/calculateExpensePaymentDate";
import { useCurrentBudget } from "@/lib/hooks/useCurrentBudget";
import { useGetProfile } from "@/lib/hooks/useGetProfile";
import { useUserId } from "@/lib/hooks/useUserId";

export default function AddExpenseForm({ budgetId }: { budgetId: string }) {
  const { data: budget } = useCurrentBudget();
  const { data: userId } = useUserId();
  const { data: profile } = useGetProfile(userId);
  const createExpense = useCreateExpense(budgetId);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDay, setPaymentDay] = useState(1);
  const [category, setCategory] = useState<ExpenseCategory>("essential");

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
            <DialogTitle>Add expense</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (!budget || !profile) return;

              createExpense.mutate({
                budget_id: budgetId,
                name: name,
                amount_pence: Number(amount),
                category: category,
                payment_date: computePaymentDateForCycle({
                  periodStart: budget.period_start,
                  monthStartDay: profile.month_start_day,
                  paymentDay: paymentDay,
                }),
                is_paid: false,
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

              <Field>
                <div>
                  <Label className="flex-col items-start">
                    Payment day
                    <P isSubtext>
                      If this day doesn't exist, we'll use the last day of the
                      month.
                    </P>
                  </Label>
                </div>
                <Select
                  items={dayOptions}
                  value={paymentDay}
                  onValueChange={(value) => setPaymentDay(Number(value))}
                  required
                >
                  <SelectTrigger className="w-full max-w-48">
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
                <Label htmlFor="category">Category</Label>
                <Select
                  items={CategorySelectOptions}
                  value={category}
                  onValueChange={(value) => setCategory(value as ExpenseCategory)}
                  required
                >
                  <SelectTrigger className="w-full max-w-48">
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
