import HomeDashboard from "@/components/blocks/home-dashboard";
import { Button, H1, P } from "@/components/ui";
import { ArrowUpRightIcon, Frown } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { buildBudgetCycleString } from "@/lib/utils/buildBudgetCycleString";
import { getUser } from "@/lib/api/user.server";
import { getProfile } from "@/lib/api/profile.server";
import { getCurrentBudget } from "@/lib/api/currentBudget.server";
import { getIncome } from "@/lib/api/income.server";
import { getExpenses } from "@/lib/api/expenses.server";
import { getBudgetSummary } from "@/lib/api/budgetSummary.server";

export default async function BudgetPage() {
  const { id: userId } = await getUser();
  const [profile, budget] = await Promise.all([
    getProfile(userId),
    getCurrentBudget(),
  ]);

  if (!profile) {
    return (
      <Empty className="mb-50 px-8">
        <EmptyHeader>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            We might be doing necessary maintenence. Please try again later.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const budgetId = budget?.id ?? null;
  const budgetCycleString = budget
    ? buildBudgetCycleString(budget.period_start, {
        nextMonthStartDay: profile.next_month_start_day,
      })
    : "—";

  if (!budgetId || !budget) {
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

  const [income, expenses, budgetSummary] = await Promise.all([
    getIncome(budgetId),
    getExpenses(budgetId),
    getBudgetSummary(budgetId),
  ]);

  return (
    <>
      <div className="flex px-4 justify-between items-end">
        <div>
          <P isSubtext>Your current financial month is</P>
          <H1 className="font-semibold border-0 pt-1">{budgetCycleString}</H1>
        </div>
      </div>

      <HomeDashboard
        budgetId={budgetId}
        periodStart={budget.period_start}
        monthStartDay={profile.month_start_day}
        income={income}
        expenses={expenses}
        budgetSummary={budgetSummary}
      />
    </>
  );
}
