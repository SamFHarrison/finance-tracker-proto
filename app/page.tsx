import AddIncome from "@/components/blocks/add-income";
import { getUserDetailsOnServer } from "@/components/getUserDetails";
import {
  Button,
  Card,
  Checkbox,
  H1,
  H3,
  P,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatCurrencyFromMinorUnits } from "@/lib/utils/formatCurrencyMinorUnits";
import { formatDayOrdinal } from "@/lib/utils/formatDayOrdinal";
import { Plus, ThumbsUp } from "lucide-react";

export default async function Page() {
  await getUserDetailsOnServer();

  const supabase = await createClient();
  const { data: budgetData, error: budgetError } = await supabase.rpc(
    "get_or_create_budget",
  );
  // TODO: Error handling
  if (budgetError) return;

  const { data: budgetSummaryData, error: budgetSummaryError } = await supabase
    .from("budget_summary")
    .select("income_total_pence")
    .eq("budget_id", budgetData.id);
  // TODO: Error handling
  if (budgetSummaryError || budgetSummaryData.length > 1) return;
  const budgetSummary = budgetSummaryData[0].income_total_pence;

  return (
    <>
      <div className="flex px-4 justify-between items-end">
        <div>
          <P isSubtext>2026</P>
          <H1>February</H1>
        </div>

        {/* <Link href="/settings">
          <Button variant="outline" size="icon-lg">
            <SettingsIcon />
          </Button>
        </Link> */}
      </div>

      <div className="px-4">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <P>Income</P>
              </TableCell>
              <TableCell className="text-right">
                <P>
                  {/* {formatCurrencyFromMinorUnits(
                    budgetSummary.income_total_pence,
                  )} */}
                </P>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <P>Ougoings</P>
              </TableCell>
              <TableCell className="text-right">
                <P>
                  {/* {formatCurrencyFromMinorUnits(
                    budgetSummary.expense_total_pence,
                  )} */}
                </P>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <H3>Still to pay</H3>
              </TableCell>
              <TableCell className="text-right">
                <H3>
                  {/* {formatCurrencyFromMinorUnits(still_to_pay_pence)} */}
                </H3>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center">
          <H3>Income</H3>

          {/* <Button variant="ghost" size="icon-lg">
            <Plus />
          </Button> */}

          <AddIncome />
        </div>

        <Card className="py-0 px-2">
          <Table>
            <TableBody>
              {/* {income.map((income, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <P>{income.name}</P>
                      <P isSubtext>
                        {income.is_monthly ? "Monthly" : "Additional"}
                      </P>
                    </TableCell>
                    <TableCell className="text-right">
                      <H3>
                        {formatCurrencyFromMinorUnits(income.amount_pence)}
                      </H3>
                    </TableCell>
                  </TableRow>
                );
              })} */}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center">
          <H3>Outgoings</H3>
          <Button variant="ghost" size="icon-lg">
            <Plus />
          </Button>
        </div>
        <Card className="py-0 px-2">
          <Table>
            <TableBody>
              {/* {expenses.map((expense, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell className="w-10">
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <P>{expense.name}</P>
                      <P isSubtext>{formatDayOrdinal(expense.payment_date)}</P>
                    </TableCell>
                    <TableCell className="text-right">
                      <H3>
                        {formatCurrencyFromMinorUnits(expense.amount_pence)}
                      </H3>
                    </TableCell>
                  </TableRow>
                );
              })} */}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="flex flex-col w-full items-center text-muted-foreground gap-1 px-4 pb-40 pt-10">
        <ThumbsUp />
        <P isSubtext>That's all</P>
      </div>
    </>
  );
}
