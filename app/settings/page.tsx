"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardTitle,
  H3,
  P,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { dayOptions } from "@/lib/contants";
import { useGetProfile } from "@/lib/hooks/useGetProfile";
import { useGetUser } from "@/lib/hooks/useGetUser";
import { useSetNextMonthStartDay } from "@/lib/hooks/useSetNextMonthStartDay";

export default function Settings() {
  const { data: user, isLoading } = useGetUser();
  const { data: profile, isLoading: isProfileLoading } = useGetProfile(
    user?.id,
  );
  const setNextMonthStartDay = useSetNextMonthStartDay(user?.id ?? "");
  const [cycleDay, setCycleDay] = useState(
    profile ? (profile.next_month_start_day ?? profile.month_start_day) : 1,
  );

  if (!user || !profile)
    return (
      <>
        <Empty className="mb-50 px-8">
          <EmptyHeader>
            <EmptyTitle>Something went wrong</EmptyTitle>
            <EmptyDescription>
              We might be doing necessary maintenence. Please try again later.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    );

  return (
    <>
      <div className="flex flex-col px-4 justify-between items-center py-10">
        <P isSubtext>Your account</P>
        <H3 className="text-lg">{user.email}</H3>
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center h-12">
          <H3>Settings</H3>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <CardTitle>Budget cycle date</CardTitle>
                <P isSubtext>
                  Choose what day you want your cycle to start on.
                </P>
              </div>

              <Select
                items={dayOptions}
                value={cycleDay}
                onValueChange={(value) => {
                  const nextDay = Number(value);
                  if (!Number.isFinite(nextDay)) return;

                  setCycleDay(nextDay);

                  if (!user.id) return;

                  const activeDay =
                    profile?.next_month_start_day ?? profile?.month_start_day;
                  if (activeDay === nextDay) return;

                  setNextMonthStartDay.mutate(nextDay);
                }}
                disabled={isProfileLoading || setNextMonthStartDay.isPending}
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Days of the month</SelectLabel>
                    {dayOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
