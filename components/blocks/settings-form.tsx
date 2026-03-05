"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  P,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { dayOptions } from "@/lib/contants";
import { useSetNextMonthStartDay } from "@/lib/hooks/useSetNextMonthStartDay";

type SettingsFormProps = {
  userId: string;
  monthStartDay: number;
  nextMonthStartDay: number | null;
};

export default function SettingsForm({
  userId,
  monthStartDay,
  nextMonthStartDay,
}: SettingsFormProps) {
  const router = useRouter();
  const setNextMonthStartDay = useSetNextMonthStartDay(userId);
  const activeDay = nextMonthStartDay ?? monthStartDay;
  const [cycleDay, setCycleDay] = useState(activeDay);

  useEffect(() => {
    setCycleDay(activeDay);
  }, [activeDay]);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <CardTitle>Budget cycle date</CardTitle>
            <P isSubtext>
              Choose what day you want your cycle to start on. It will take
              effect on your next cycle.
            </P>
          </div>

          <Select
            items={dayOptions}
            value={cycleDay}
            onValueChange={(value) => {
              const nextDay = Number(value);
              if (!Number.isFinite(nextDay)) return;

              setCycleDay(nextDay);
              if (activeDay === nextDay) return;

              setNextMonthStartDay.mutate(nextDay, {
                onError: () => {
                  setCycleDay(activeDay);
                },
                onSuccess: () => {
                  router.refresh();
                },
              });
            }}
            disabled={setNextMonthStartDay.isPending}
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
  );
}
