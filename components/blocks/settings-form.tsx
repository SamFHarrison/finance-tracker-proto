"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { dayOptions } from "@/lib/contants";
import { useMutateProfile } from "@/lib/hooks/useMutateProfile";
import { useSetNextMonthStartDay } from "@/lib/hooks/useSetNextMonthStartDay";

type SettingsFormProps = {
  userId: string;
  displayName: string | null;
  monthStartDay: number;
  nextMonthStartDay: number | null;
};

export default function SettingsForm({
  userId,
  displayName,
  monthStartDay,
  nextMonthStartDay,
}: SettingsFormProps) {
  const router = useRouter();
  const mutateProfile = useMutateProfile(userId);
  const setNextMonthStartDay = useSetNextMonthStartDay(userId);
  const activeDay = nextMonthStartDay ?? monthStartDay;
  const activeDisplayName = displayName ?? "";
  const [cycleDay, setCycleDay] = useState(activeDay);
  const [displayNameValue, setDisplayNameValue] = useState(activeDisplayName);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setCycleDay(activeDay);
  }, [activeDay]);

  useEffect(() => {
    setDisplayNameValue(activeDisplayName);
  }, [activeDisplayName]);

  const nextDisplayName = displayNameValue.trim();
  const hasDisplayNameChanges = nextDisplayName !== activeDisplayName.trim();
  const hasCycleDayChanges = cycleDay !== activeDay;
  const hasChanges = hasDisplayNameChanges || hasCycleDayChanges;
  const isSaving = mutateProfile.isPending || setNextMonthStartDay.isPending;

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!hasChanges) return;

        setSaveError(null);
        const operations: Promise<unknown>[] = [];

        if (hasDisplayNameChanges) {
          operations.push(
            mutateProfile.mutateAsync({
              patch: {
                display_name: nextDisplayName.length ? nextDisplayName : null,
              },
            }),
          );
        }

        if (hasCycleDayChanges) {
          operations.push(setNextMonthStartDay.mutateAsync(cycleDay));
        }

        const results = await Promise.allSettled(operations);
        const firstFailure = results.find(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected",
        );
        const hasSuccess = results.some(
          (result) => result.status === "fulfilled",
        );

        if (hasSuccess) {
          router.refresh();
        }

        if (firstFailure) {
          setSaveError(
            firstFailure.reason instanceof Error
              ? firstFailure.reason.message
              : "Unable to save settings.",
          );
        }
      }}
    >
      <Card>
        <CardContent>
          <FieldSet className="gap-6">
            <Field>
              <FieldLabel htmlFor="display-name">Display name</FieldLabel>
              <FieldDescription>
                Set your display name for a more personal experience in the app.
              </FieldDescription>
              <Input
                id="display-name"
                type="text"
                value={displayNameValue}
                onChange={(event) => {
                  setDisplayNameValue(event.target.value);
                  if (saveError) setSaveError(null);
                }}
                placeholder="Display name"
                maxLength={80}
                disabled={isSaving}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="budget-cycle-day">Budget cycle date</FieldLabel>
              <FieldDescription>
                Choose what day you want your cycle to start on. It will take
                effect on your next cycle.
              </FieldDescription>
              <Select
                items={dayOptions}
                value={cycleDay}
                onValueChange={(value) => {
                  const nextDay = Number(value);
                  if (!Number.isFinite(nextDay)) return;
                  setCycleDay(nextDay);
                  if (saveError) setSaveError(null);
                }}
                disabled={isSaving}
              >
                <SelectTrigger id="budget-cycle-day" className="w-full max-w-48">
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
            </Field>

            <FieldError>{saveError}</FieldError>
          </FieldSet>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button type="submit" disabled={isSaving || !hasChanges}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
