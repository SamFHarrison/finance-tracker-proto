"use client";

import { Button, H3, P } from "@/components/ui";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useGetUser } from "@/lib/hooks/useGetUser";
import { ArrowLeft, Frown } from "lucide-react";
import Link from "next/link";

export default function Settings() {
  const { data: user, isLoading } = useGetUser();

  if (isLoading)
    return (
      <Empty>
        <Spinner className="size-10" />
      </Empty>
    );

  if (!user)
    return (
      <>
        <Link href="/">
          <Button variant="outline" size="icon" className="ml-4">
            <ArrowLeft />
          </Button>
        </Link>

        <Empty className="mb-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Frown size={200} />
            </EmptyMedia>
            <EmptyTitle>Something went wrong</EmptyTitle>
            <EmptyDescription>
              We seem to have an issue on our end. We might be doing necessary
              maintenence. Please try again later.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    );

  return (
    <>
      <Link href="/">
        <Button variant="outline" size="icon" className="ml-4">
          <ArrowLeft />
        </Button>
      </Link>

      <div className="flex flex-col px-4 justify-between items-center pt-10">
        <P isSubtext>Your account</P>
        <H3 className="text-lg">{isLoading ? "—" : (user?.email ?? "—")}</H3>
      </div>
    </>
  );
}
