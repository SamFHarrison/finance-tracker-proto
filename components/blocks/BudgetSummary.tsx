"use client";

import {
  Label,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { H3, P } from "../ui";
import { formatCurrencyFromMinorUnits } from "@/lib/utils/formatCurrencyMinorUnits";
import { BudgetSummary as BudgetSummaryData } from "@/lib/types/appTypes";

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "var(--chart-4)",
  },
  track: {
    label: "Track",
    color: "var(--muted)",
  },
} satisfies ChartConfig;

type BudgetSummaryProps = {
  budgetSummary: BudgetSummaryData | null;
};

export function BudgetSummary({ budgetSummary }: BudgetSummaryProps) {
  const incomeTotalPence = Number(budgetSummary?.income_total_pence ?? 0);
  const expenseTotalPence = Number(budgetSummary?.expense_total_pence ?? 0);
  const hasIncome = incomeTotalPence > 0;
  const usagePercent = hasIncome
    ? (expenseTotalPence / incomeTotalPence) * 100
    : 0;
  const normalizedExpensePercent = hasIncome ? Math.min(usagePercent, 100) : 0;

  const chartData = [
    {
      label: "Budget",
      expenses: normalizedExpensePercent,
    },
  ];

  return (
    <Card className="flex flex-col py-4 gap-2">
      <CardContent className="flex flex-1 px-4 items-center justify-between pb-0">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <P isSubtext>Total income</P>
            <H3 className="tabular-nums">
              {formatCurrencyFromMinorUnits(incomeTotalPence)}
            </H3>
          </div>
          <div className="flex flex-col">
            <P isSubtext>Total expenses</P>
            <H3 className="tabular-nums">
              {formatCurrencyFromMinorUnits(expenseTotalPence)}
            </H3>
          </div>
          <div className="flex flex-col">
            <P isSubtext>Still to pay</P>
            <H3 className="tabular-nums">
              {formatCurrencyFromMinorUnits(
                budgetSummary?.still_to_pay_pence ?? 0,
              )}
            </H3>
          </div>
        </div>

        <ChartContainer
          id="budget-summary"
          config={chartConfig}
          className="aspect-square w-full max-w-42 pt-2"
        >
          <RadialBarChart
            data={chartData}
            startAngle={230}
            endAngle={-50}
            innerRadius={70}
            outerRadius={120}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 8}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {`${Math.round(usagePercent)}%`}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 14}
                          className="fill-muted-foreground text-sm"
                        >
                          income used
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="expenses"
              fill={
                usagePercent > 100
                  ? "var(--color-destructive)"
                  : "var(--color-expenses)"
              }
              className="stroke-transparent stroke-2"
              cornerRadius={16}
              background={{
                fill: "var(--color-muted)",
              }}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
