/**
 * Format an amount expressed in **minor units** (e.g. pence) as a localized currency string.
 *
 * This is the recommended representation for money in apps because it avoids floating-point
 * precision issues (store integers, format for display).
 *
 * @param minorUnits - Amount in minor units (for GBP: pence). Example: `3000` = £30.00
 * @param options
 * @param options.currency - ISO 4217 currency code. Defaults to `"GBP"`.
 * @param options.locale - BCP 47 locale tag used for formatting. Defaults to `"en-GB"`.
 * @returns A formatted currency string (e.g. `"£30.00"`). Returns `"—"` if input is not finite.
 *
 * @example
 * formatCurrencyFromMinorUnits(3000) // "£30.00"
 * formatCurrencyFromMinorUnits(123456) // "£1,234.56"
 * formatCurrencyFromMinorUnits(-99) // "-£0.99"
 *
 * @remarks
 * - This implementation assumes a 2-decimal minor unit currency (like GBP, USD, EUR).
 *   If you need currencies with different minor unit scales (e.g. JPY = 0, KWD = 3),
 *   you can extend this util to accept a `minorUnitScale` option, or derive it from
 *   currency metadata.
 */
export function formatCurrencyFromMinorUnits(
  minorUnits: number,
  {
    currency = "GBP",
    locale = "en-GB",
  }: { currency?: string; locale?: string } = {},
): string {
  if (!Number.isFinite(minorUnits)) return "—";

  // For 2-decimal currencies: minorUnits (pence) -> majorUnits (pounds)
  const majorUnits = minorUnits / 100;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorUnits);
}
