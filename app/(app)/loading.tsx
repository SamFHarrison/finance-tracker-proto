import { Spinner } from "@/components/ui/spinner";
import { Empty } from "@/components/ui/empty";

export default function Loading() {
  return (
    <Empty>
      <Spinner className="size-10" />
    </Empty>
  );
}
