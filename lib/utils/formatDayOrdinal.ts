/**
 * Format a date as a **day-of-month ordinal** string (English suffix), e.g. `"25th"`.
 *
 * Uses the Intl APIs to:
 *  - Extract the day-of-month according to the provided `locale`
 *  - Determine the ordinal category via `Intl.PluralRules` with `{ type: "ordinal" }`
 *
 * @param input - Either a `Date` or an ISO-like date string in `"YYYY-MM-DD"` form.
 *                For `"YYYY-MM-DD"` strings, the function appends `"T00:00:00"` to
 *                reduce timezone-related day shifting.
 * @param locale - BCP 47 locale tag used for Intl formatting. Defaults to `"en-GB"`.
 * @returns The ordinal day string (e.g. `"1st"`, `"2nd"`, `"3rd"`, `"4th"`, `"11th"`, `"25th"`).
 *          Returns `"—"` if the input is invalid.
 *
 * @example
 * formatDayOrdinal("2026-02-25") // "25th"
 * formatDayOrdinal("2026-02-01") // "1st"
 * formatDayOrdinal(new Date("2026-02-12T10:00:00Z")) // "12th"
 *
 * @remarks
 * - The returned suffix mapping (`st/nd/rd/th`) is **English-specific**. While `Intl.PluralRules`
 *   provides ordinal categories for many locales, the actual ordinal *rendering* differs between
 *   languages (e.g. French `"1er"`, Spanish `"1.º"`). If you need true multilingual ordinals,
 *   you'll want a locale-specific formatter rather than English suffixes.
 * - If you pass a `Date`, the **local timezone** influences which calendar day is extracted.
 *   If you need timezone-stable behaviour, consider passing a `"YYYY-MM-DD"` string or
 *   constructing the `Date` in a controlled timezone.
 */
export function formatDayOrdinal(
  input: string | Date,
  locale: string = "en-GB",
): string {
  const date =
    typeof input === "string"
      ? new Date(`${input}T00:00:00`) // avoid timezone shifting for YYYY-MM-DD
      : input;

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";

  // Get the day-of-month using Intl
  const parts = new Intl.DateTimeFormat(locale, {
    day: "numeric",
  }).formatToParts(date);
  const dayPart = parts.find((p) => p.type === "day")?.value;
  const day = dayPart ? Number(dayPart) : NaN;

  if (!Number.isFinite(day) || day < 1 || day > 31) return "—";

  // Use Intl plural rules for ordinal category (one/two/few/other)
  const rule = new Intl.PluralRules(locale, { type: "ordinal" }).select(day);

  // English suffix mapping (works for en-GB/en-US)
  const suffix =
    rule === "one"
      ? "st"
      : rule === "two"
        ? "nd"
        : rule === "few"
          ? "rd"
          : "th";

  return `${day}${suffix}`;
}
