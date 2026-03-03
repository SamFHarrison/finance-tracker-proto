"use client";

import AddExpenseForm from "@/components/blocks/add-expense";
import AddIncomeForm from "@/components/blocks/add-income";
import ExpenseTableRow from "@/components/blocks/expense-row";
import IncomeTableRow from "@/components/blocks/income-row";
import { Button, Card, H1, H3, P, Table, TableBody } from "@/components/ui";
import { ArrowUpRightIcon, Frown, ThumbsUp } from "lucide-react";
import { useCurrentBudget } from "@/lib/hooks/useCurrentBudget";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useGetIncome } from "@/lib/hooks/useGetIncome";
import { useGetExpenses } from "@/lib/hooks/useGetExpenses";
import { buildBudgetCycleString } from "@/lib/utils/buildBudgetCycleString";
import { useGetProfile } from "@/lib/hooks/useGetProfile";
import { useGetUser } from "@/lib/hooks/useGetUser";
import { BudgetSummary } from "@/components/blocks/BudgetSummary";

export default function Page() {
  const { data: user, isLoading: userLoading } = useGetUser();
  const { data: profile, isLoading: profileLoading } = useGetProfile(user?.id);
  const { data: budget, isLoading: budgetLoading } = useCurrentBudget();
  const budgetId = budget?.id;
  const isBudgetCycleLoading =
    userLoading || (Boolean(user?.id) && profileLoading);
  const budgetCycleString = budget
    ? isBudgetCycleLoading
      ? "—"
      : buildBudgetCycleString(budget.period_start, {
          nextMonthStartDay: profile?.next_month_start_day,
        })
    : "—";

  const { data: income } = useGetIncome(budgetId);
  const { data: expenses } = useGetExpenses(budgetId);

  if (budgetLoading)
    return (
      <Empty>
        <Spinner className="size-10" />
      </Empty>
    );

  if (!budgetLoading && !budgetId) {
    return (
      // TODO: Turn into empty error page component
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Frown size={100} />
          </EmptyMedia>
          <EmptyTitle>Create a new budget</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any projects yet. Get started by creating
            your first project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button>Create Project</Button>
          <Button variant="outline">Import Project</Button>
        </EmptyContent>
        <Button variant="link" className="text-muted-foreground" size="sm">
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
    );
  }

  return (
    <>
      <div className="flex px-4 justify-between items-end">
        <div>
          <P isSubtext>Your current financial month is</P>
          <H1 className="font-semibold border-0 pt-1">{budgetCycleString}</H1>
        </div>

        {/* <Link href="/settings">
          <Button variant="outline" size="icon-lg">
            <SettingsIcon />
          </Button>
        </Link> */}
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center h-12">
          <H3>Summary</H3>
        </div>

        <BudgetSummary />
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center h-12">
          <H3>Income</H3>

          {budgetId && <AddIncomeForm budgetId={budgetId} />}
        </div>

        <Card className="py-0 px-2">
          <Table>
            <TableBody>
              {income &&
                budgetId &&
                income.map((income) => {
                  return (
                    <IncomeTableRow
                      key={income.id}
                      income={income}
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

          {budgetId && <AddExpenseForm budgetId={budgetId} />}
        </div>
        <Card className="py-0 px-2">
          <Table>
            <TableBody>
              {expenses &&
                budgetId &&
                expenses.map((expense) => {
                  return (
                    <ExpenseTableRow
                      key={expense.id}
                      budgetId={budgetId}
                      expense={expense}
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
