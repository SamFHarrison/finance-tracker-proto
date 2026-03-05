"use client";

import { useState } from "react";
import AddExpenseForm from "@/components/blocks/add-expense";
import AddIncomeForm from "@/components/blocks/add-income";
import ExpenseTableRow from "@/components/blocks/expense-row";
import IncomeTableRow from "@/components/blocks/income-row";
import { BudgetSummary } from "@/components/blocks/BudgetSummary";
import { Card, H3, P, Table, TableBody } from "@/components/ui";
import { ThumbsUp } from "lucide-react";
import { ExpenseRow, IncomeRow } from "@/lib/supabase/types/types";
import { BudgetSummary as BudgetSummaryData } from "@/lib/types/appTypes";

type HomeDashboardProps = {
  budgetId: string;
  periodStart: string;
  monthStartDay: number;
  income: IncomeRow[];
  expenses: ExpenseRow[];
  budgetSummary: BudgetSummaryData | null;
};

export default function HomeDashboard({
  budgetId,
  periodStart,
  monthStartDay,
  income,
  expenses,
  budgetSummary,
}: HomeDashboardProps) {
  const [stillToPayPence, setStillToPayPence] = useState(
    budgetSummary?.still_to_pay_pence ?? 0,
  );

  const optimisticSummary = budgetSummary
    ? {
        ...budgetSummary,
        still_to_pay_pence: stillToPayPence,
      }
    : null;

  return (
    <>
      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center h-12">
          <H3>Summary</H3>
        </div>

        <BudgetSummary budgetSummary={optimisticSummary} />
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center h-12">
          <H3>Income</H3>

          <AddIncomeForm budgetId={budgetId} />
        </div>

        <Card className="py-0 px-2">
          <Table>
            <TableBody>
              {income.map((incomeItem) => {
                return (
                  <IncomeTableRow
                    key={incomeItem.id}
                    income={incomeItem}
                    budgetId={budgetId}
                  />
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center h-12">
          <H3>Expenses</H3>

          <AddExpenseForm
            budgetId={budgetId}
            periodStart={periodStart}
            monthStartDay={monthStartDay}
          />
        </div>
        <Card className="py-0 px-2">
          <Table>
            <TableBody>
              {expenses.map((expense) => {
                return (
                  <ExpenseTableRow
                    key={expense.id}
                    budgetId={budgetId}
                    expense={expense}
                    periodStart={periodStart}
                    monthStartDay={monthStartDay}
                    onStillToPayDelta={(deltaPence) => {
                      setStillToPayPence((previousValue) =>
                        Math.max(0, previousValue + deltaPence),
                      );
                    }}
                  />
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="flex flex-col w-full items-center text-muted-foreground gap-1 px-4 pb-40 pt-10">
        <ThumbsUp />
        <P isSubtext>That&apos;s all</P>
      </div>
    </>
  );
}
