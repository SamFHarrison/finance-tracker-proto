import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { H1, H2, H3, P } from '@/components/ui/typography';
import { ArrowUpIcon, Plus } from 'lucide-react';

export default function Page() {
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
                <P>£1,234</P>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <P>Ougoings</P>
              </TableCell>
              <TableCell className="text-right">
                <P>£1,234</P>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <H3>Still to pay</H3>
              </TableCell>
              <TableCell className="text-right">
                <H3>£1,234</H3>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-end">
          <H3>Income</H3>
          <Button variant="outline" size="icon-lg">
            <Plus />
          </Button>
        </div>
        <Card className="p-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="px-4">
                  <P>Work</P>
                  <P isSubtext>Monthly</P>
                </TableCell>
                <TableCell className="px-4 text-right">
                  <H3>£2,120</H3>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
