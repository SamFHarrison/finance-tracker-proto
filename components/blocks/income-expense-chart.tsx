"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useCurrentBudget } from "@/lib/hooks/useCurrentBudget";
import { useGetBudgetSummary } from "@/lib/hooks/useGetBudgetSummary";
import { formatCurrencyFromMinorUnits } from "@/lib/utils/formatCurrencyMinorUnits";
import { H3, P } from "../ui";

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "var(--chart-1)",
  },
  remaining: {
    label: "Remaining",
    color: "var(--muted)",
  },
} satisfies ChartConfig;

export function ChartBarHorizontal() {
  const { data: budget } = useCurrentBudget();
  const budgetId = budget?.id;
  const { data: budgetSummary } = useGetBudgetSummary(budgetId);

  const incomeTotalPence = Number(budgetSummary?.income_total_pence ?? 0);
  const expenseTotalPence = Number(budgetSummary?.expense_total_pence ?? 0);
  const hasIncome = incomeTotalPence > 0;
  const remainingIncomePence = Math.max(
    incomeTotalPence - expenseTotalPence,
    0,
  );
  const overspendPence = Math.max(expenseTotalPence - incomeTotalPence, 0);
  const usagePercent = hasIncome
    ? (expenseTotalPence / incomeTotalPence) * 100
    : 0;
  const normalizedExpensePercent = hasIncome ? Math.min(usagePercent, 100) : 0;
  const normalizedRemainingPercent = hasIncome
    ? Math.max(100 - normalizedExpensePercent, 0)
    : 100;
  const expenseRadius =
    normalizedRemainingPercent > 0 ? [999, 0, 0, 999] : [999, 999, 999, 999];
  const remainingRadius =
    normalizedExpensePercent > 0 ? [0, 999, 999, 0] : [999, 999, 999, 999];

  const chartData = [
    {
      label: "Budget",
      expenses: normalizedExpensePercent,
      remaining: normalizedRemainingPercent,
    },
  ];

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1 flex gap-4">
            {hasIncome && (
              <p className="text-4xl font-semibold tabular-nums">
                {`${Math.round(usagePercent)}%`}
              </p>
            )}
            {hasIncome ? (
              <P isSubtext className="h-max">
                of your income is being used
              </P>
            ) : (
              <P>Add income to compare it against your expenses</P>
            )}
          </div>
        </div>

        <ChartContainer
          className="aspect-auto h-10 w-full"
          config={chartConfig}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="label" type="category" hide />
            <Bar
              dataKey="expenses"
              stackId="budget"
              fill={
                usagePercent > 100
                  ? "var(--color-destructive)"
                  : "var(--color-expenses)"
              }
              radius={expenseRadius as [number, number, number, number]}
            />
            <Bar
              dataKey="remaining"
              stackId="budget"
              fill="var(--color-remaining)"
              radius={remainingRadius as [number, number, number, number]}
            />
          </BarChart>
        </ChartContainer>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground tabular-nums">
          <p>{`${formatCurrencyFromMinorUnits(expenseTotalPence)} / ${formatCurrencyFromMinorUnits(incomeTotalPence)}`}</p>
          {/* <p>
            {overspendPence > 0
              ? `${formatCurrencyFromMinorUnits(overspendPence)} over income`
              : hasIncome
                ? `${formatCurrencyFromMinorUnits(remainingIncomePence)} left`
                : "No income recorded"}
          </p> */}
        </div>
      </CardContent>
    </Card>
  );
}
