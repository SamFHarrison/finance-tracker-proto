import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ChartPie } from "lucide-react";

export default function AnalysisPage() {
  return (
    <Empty className="mb-50 px-8">
      <EmptyHeader>
        <ChartPie className="size-10" />
        <EmptyTitle>Coming Soon</EmptyTitle>
        <EmptyDescription>
          I&apos;m building features to help you plan and improve your monthly
          budgets using the 50:30:20 rule.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
