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
import { useCreateIncome } from "@/lib/hooks/useCreateIncome";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { parseCurrencyToMinorUnits } from "@/lib/utils/parseCurrencyToMinorUnits";
import IncomeFormFields from "./income-form-fields";
import { useRouter } from "next/navigation";

export default function AddIncomeForm({ budgetId }: { budgetId: string }) {
  const router = useRouter();
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
                  router.refresh();
                },
              },
            );
          }}
        >
          <IncomeFormFields
            idPrefix="add-income"
            name={name}
            amount={amount}
            isMonthly={isMonthly}
            disabled={createIncome.isPending}
            namePlaceholder="Rent"
            amountRequired
            onNameChange={setName}
            onAmountChange={setAmount}
            onIsMonthlyChange={setIsMonthly}
          />

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
