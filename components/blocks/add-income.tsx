import { createClient } from "@/lib/supabase/server";
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

export default async function addIncome() {
  const supabase = await createClient();

  const { data: budget, error: RPCError } = await supabase.rpc(
    "get_or_create_budget",
  );
  if (RPCError) return;

  const { error } = await supabase
    .from("income")
    .insert({ amount_pence: 15000, name: "Rent", budget_id: budget?.id });

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

          <FieldGroup>
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" />
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
              />
            </Field>

            <Field className="flex-row">
              <Label htmlFor="isMonthly">Add this income every month</Label>
              <Switch id="isMonthly" />
            </Field>
          </FieldGroup>

          <DialogFooter className="flex-row">
            <Button type="submit" className="w-full">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
