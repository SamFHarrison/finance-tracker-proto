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
import { Button } from "../ui";
import { useCreateExpense } from "@/lib/hooks/useCreateExpense";
import { useState } from "react";
import { ExpenseCategory } from "@/lib/contants";
import { computePaymentDateForCycle } from "@/lib/utils/calculateExpensePaymentDate";
import { Spinner } from "../ui/spinner";
import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import ExpenseFormFields from "./expense-form-fields";
import { useRouter } from "next/navigation";

type AddExpenseFormProps = {
  budgetId: string;
  periodStart: string;
  monthStartDay: number;
};

export default function AddExpenseForm({
  budgetId,
  periodStart,
  monthStartDay,
}: AddExpenseFormProps) {
  const router = useRouter();
  const createExpense = useCreateExpense(budgetId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDay, setPaymentDay] = useState(1);
  const [category, setCategory] = useState<ExpenseCategory>("essential");

  const resetForm = () => {
    setName("");
    setAmount("");
    setPaymentDay(1);
    setCategory("essential");
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
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const amountPence = parseCurrencyToMinorUnits(amount);
            if (amountPence === null) return;

            createExpense.mutate(
              {
                budget_id: budgetId,
                name: name,
                amount_pence: amountPence,
                category: category,
                payment_date: computePaymentDateForCycle({
                  periodStart,
                  monthStartDay,
                  paymentDay: paymentDay,
                }),
                is_paid: false,
              },
              {
                onSuccess: () => {
                  resetForm();
                  setOpen(false);
                  router.refresh();
                },
              },
            );
          }}
        >
          <ExpenseFormFields
            idPrefix="add-expense"
            name={name}
            amount={amount}
            paymentDay={paymentDay}
            category={category}
            disabled={createExpense.isPending}
            amountRequired
            onNameChange={setName}
            onAmountChange={setAmount}
            onPaymentDayChange={setPaymentDay}
            onCategoryChange={setCategory}
          />

          <DialogFooter className="flex-row">
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={createExpense.isPending}
            >
              {createExpense.isPending && <Spinner />}
              {createExpense.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
