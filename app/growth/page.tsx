import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Sprout } from "lucide-react";

export default function GrowthPage() {
  return (
    <Empty className="mb-50 px-8">
      <EmptyHeader>
        <Sprout className="size-10" />
        <EmptyTitle>Coming Soon</EmptyTitle>
        <EmptyDescription>
          I&apos;m building features to calculate financial health metrics like
          debt-to-income ratio and net worth.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
