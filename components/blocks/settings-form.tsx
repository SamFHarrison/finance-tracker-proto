"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
import { Spinner } from "../ui/spinner";

type SettingsFormProps = {
  userId: string;
  displayName: string | null;
  monthStartDay: number;
  nextMonthStartDay: number | null;
};

const settingsFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(30, "Display name must be 30 characters or fewer."),
  cycleDay: z.number().int().min(1).max(31),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

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
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      displayName: activeDisplayName,
      cycleDay: activeDay,
    },
  });

  useEffect(() => {
    reset({
      displayName: activeDisplayName,
      cycleDay: activeDay,
    });
    setSaveError(null);
  }, [activeDisplayName, activeDay, reset]);

  const displayNameValue = watch("displayName") ?? "";
  const cycleDayValue = watch("cycleDay") ?? activeDay;

  useEffect(() => {
    if (!saveError) return;
    setSaveError(null);
  }, [displayNameValue, cycleDayValue, saveError]);

  const hasDisplayNameChanges =
    displayNameValue.trim() !== activeDisplayName.trim();
  const hasCycleDayChanges = cycleDayValue !== activeDay;

  const hasChanges = hasDisplayNameChanges || hasCycleDayChanges;
  const isSaving =
    isSubmitting || mutateProfile.isPending || setNextMonthStartDay.isPending;
  const discardChanges = () => {
    reset({
      displayName: activeDisplayName,
      cycleDay: activeDay,
    });
    setSaveError(null);
  };

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (!hasChanges) return;

        setSaveError(null);
        const nextDisplayName = values.displayName.trim();
        const operations: Promise<unknown>[] = [];

        if (hasDisplayNameChanges) {
          operations.push(
            mutateProfile.mutateAsync({
              patch: {
                display_name:
                  nextDisplayName.length > 0 ? nextDisplayName : null,
              },
            }),
          );
        }

        if (hasCycleDayChanges) {
          operations.push(setNextMonthStartDay.mutateAsync(values.cycleDay));
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
      })}
    >
      <Card>
        <CardContent>
          <FieldSet className="gap-6">
            <Controller
              name="displayName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="display-name">Display name</FieldLabel>
                  <FieldDescription>
                    Set your display name for a more personal experience.
                  </FieldDescription>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Display name"
                    maxLength={80}
                    disabled={isSaving}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="cycleDay"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="budget-cycle-day">
                    Budget cycle date
                  </FieldLabel>
                  <FieldDescription>
                    Choose what day you want your cycle to start on. It will
                    take effect on your next cycle.
                  </FieldDescription>

                  <Select
                    items={dayOptions}
                    value={field.value ?? activeDay}
                    onValueChange={(value) => {
                      const nextDay = Number(value);
                      if (!Number.isFinite(nextDay)) return;
                      field.onChange(nextDay);
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger
                      id="budget-cycle-day"
                      className="w-full max-w-48"
                    >
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
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <FieldError>{saveError}</FieldError>
          </FieldSet>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t">
          <Button
            type="button"
            variant="destructive"
            className="w-full shrink"
            disabled={isSaving || !hasChanges}
            onClick={discardChanges}
          >
            Discard changes
          </Button>
          <Button
            className="w-full shrink"
            type="submit"
            disabled={isSaving || !hasChanges}
          >
            {isSaving && <Spinner />}
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
