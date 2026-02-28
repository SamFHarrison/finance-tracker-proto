import { escapeRegExp } from "./escapeRegEx";

/**
 * Parse a human-entered money string into an integer amount in **minor units** (e.g. pence).
 *
 * Designed for user input fields where values may include currency symbols, whitespace,
 * grouping separators, or localized decimal separators.
 *
 * @param input - A user-entered string, e.g. `"£30.00"`, `"30"`, `"1,234.56"`, `"(£1.23)"`.
 * @param options
 * @param options.locale - Locale used to interpret grouping/decimal separators. Defaults to `"en-GB"`.
 * @returns The amount in minor units (for GBP: pence) or `null` if the input cannot be parsed.
 *
 * @example
 * parseCurrencyToMinorUnits("£30.00") // 3000
 * parseCurrencyToMinorUnits("30") // 3000
 * parseCurrencyToMinorUnits("30.5") // 3050
 * parseCurrencyToMinorUnits("(£1,234.56)") // -123456
 *
 * @remarks
 * - Rounds to the nearest minor unit (penny) via `Math.round(value * 100)`.
 *   If you prefer strict validation (reject >2 decimal places rather than rounding),
 *   you can add a check on the fractional length before converting.
 * - Intended for 2-decimal currencies. If you support currencies with different minor
 *   unit scales, accept a `minorUnitScale` option (0/2/3) and multiply by `10 ** scale`.
 * - Parsing is “best effort” for typical currency input; it does not validate that the
 *   currency symbol matches any specific currency code.
 */
export function parseCurrencyToMinorUnits(
  input: string,
  { locale = "en-GB" }: { locale?: string } = {},
): number | null {
  if (typeof input !== "string") return null;

  const raw = input.trim();
  if (!raw) return null;

  // Detect the locale's group/decimal separators using a known formatted number.
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";

  // Keep digits, minus sign, and separators; strip currency symbols and other text.
  const allowed = new RegExp(
    `[^0-9\\-\\${escapeRegExp(group)}\\${escapeRegExp(decimal)}]`,
    "g",
  );
  let cleaned = raw.replace(allowed, "");

  // Handle parentheses as negative, e.g. "(£1.23)".
  const isParenNegative = /^\(.*\)$/.test(raw);
  if (isParenNegative) cleaned = "-" + cleaned.replace(/[()]/g, "");

  // Remove grouping separators, normalize decimal to "."
  const groupRE = new RegExp(`\\${escapeRegExp(group)}`, "g");
  cleaned = cleaned.replace(groupRE, "").replace(decimal, ".");

  // Validate final numeric shape (avoid partially valid inputs like "-" or ".")
  if (
    !/^-?\d*(\.\d*)?$/.test(cleaned) ||
    cleaned === "-" ||
    cleaned === "." ||
    cleaned === "-."
  ) {
    return null;
  }

  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;

  // Convert major units -> minor units and round to nearest penny.
  return Math.round(value * 100);
}
