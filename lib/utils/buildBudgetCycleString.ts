import { formatDayOrdinal } from "@/lib/utils/formatDayOrdinal";

type BuildBudgetCycleStringOptions = {
  locale?: string;
  nextCycleStart?: string | null;
  nextMonthStartDay?: number | null;
};

/**
 * Build a human-readable budget cycle range from a cycle start date.
 *
 * Interprets `periodStart` as a local `YYYY-MM-DD` date, resolves the next
 * cycle boundary from either:
 * - an explicit `nextCycleStart`
 * - a staged `nextMonthStartDay` in the following calendar month
 * - or the current cycle's day-of-month in the following month
 *
 * It then formats the visible range as:
 * `"18th Feb - 17th Mar"`.
 *
 * @param periodStart - Budget cycle start date in `YYYY-MM-DD` format.
 * @param options - Optional formatting and boundary overrides.
 * @param options.locale - BCP 47 locale used for month formatting and ordinal
 * rules. Defaults to `"en-GB"`.
 * @param options.nextCycleStart - Exact next cycle start in `YYYY-MM-DD`
 * format. When provided and valid, this takes precedence.
 * @param options.nextMonthStartDay - Staged start day for the next cycle
 * (1..31). The day is applied to the month after `periodStart`, with month-end
 * clamping.
 * @returns A formatted cycle string, or `"—"` when the input cannot be parsed.
 *
 * @example
 * buildBudgetCycleString("2026-02-18")
 * // "18th Feb - 17th Mar"
 *
 * @example
 * buildBudgetCycleString("2026-02-01", { nextMonthStartDay: 19 })
 * // "1st Feb - 18th Mar"
 */
export function buildBudgetCycleString(
  periodStart: string,
  options: BuildBudgetCycleStringOptions = {},
): string {
  const { locale = "en-GB", nextCycleStart, nextMonthStartDay } = options;
  const cycleStart = parseLocalDate(periodStart);

  if (!cycleStart) return "—";

  const explicitNextCycleStart = parseLocalDate(nextCycleStart ?? "");
  const validatedNextCycleStart =
    explicitNextCycleStart &&
    explicitNextCycleStart.getTime() > cycleStart.getTime()
      ? explicitNextCycleStart
      : null;
  const resolvedNextCycleStart =
    validatedNextCycleStart ??
    (nextMonthStartDay == null
      ? getNextCycleStart(cycleStart, cycleStart.getDate())
      : getNextCycleStart(cycleStart, nextMonthStartDay));

  const cycleEnd = new Date(
    resolvedNextCycleStart.getFullYear(),
    resolvedNextCycleStart.getMonth(),
    resolvedNextCycleStart.getDate() - 1,
  );

  return `${formatDayOrdinal(cycleStart, locale)} ${formatMonthShort(cycleStart, locale)} - ${formatDayOrdinal(cycleEnd, locale)} ${formatMonthShort(cycleEnd, locale)}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function getNextCycleStart(cycleStart: Date, startDay: number) {
  const nextMonth = cycleStart.getMonth() + 1;
  const nextMonthLastDay = new Date(
    cycleStart.getFullYear(),
    nextMonth + 1,
    0,
  ).getDate();

  return new Date(
    cycleStart.getFullYear(),
    nextMonth,
    Math.min(clampInt(startDay, 1, 31), nextMonthLastDay),
  );
}

function formatMonthShort(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;

  return Math.max(min, Math.min(max, Math.trunc(n)));
}
