import {
  Avatar,
  AvatarFallback,
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
import { MOCK_CURRENT_BUDGET_PAGE, MOCK_CURRENT_SUMMARY } from "@/mocks/user";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return data.claims;
}

export default async function Page() {
  await UserDetails();

  const supabase = await createClient();
  const { data: profileData } = await supabase.from("profiles").select();
  console.log("profileData", profileData);

  const { still_to_pay_pence, expense_total_pence, income_total_pence } =
    MOCK_CURRENT_SUMMARY;
  const { expenses, income } = MOCK_CURRENT_BUDGET_PAGE;

  return (
    <>
      <div className="flex px-4 justify-between items-end">
        <div>
          <P isSubtext>2026</P>
          <H1>February</H1>
        </div>

        <Avatar size="lg">
          <AvatarFallback>SF</AvatarFallback>
        </Avatar>
      </div>

      <div className="px-4">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <P>Income</P>
              </TableCell>
              <TableCell className="text-right">
                <P>{formatCurrencyFromMinorUnits(income_total_pence)}</P>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <P>Ougoings</P>
              </TableCell>
              <TableCell className="text-right">
                <P>{formatCurrencyFromMinorUnits(expense_total_pence)}</P>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <H3>Still to pay</H3>
              </TableCell>
              <TableCell className="text-right">
                <H3>{formatCurrencyFromMinorUnits(still_to_pay_pence)}</H3>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center">
          <H3>Income</H3>
          <Button variant="ghost" size="icon-lg">
            <Plus />
          </Button>
        </div>
        <Card className="py-0 px-2">
          <Table>
            <TableBody>
              {income.map((income, idx) => {
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
              })}
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
              {expenses.map((expense, idx) => {
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
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
