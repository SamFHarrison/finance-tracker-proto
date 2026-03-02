/**
 * Convert an amount stored in minor units (for GBP: pence) into a fixed
 * 2-decimal string suitable for a form input.
 */
export function formatMinorUnitsForInput(minorUnits: number): string {
  if (!Number.isFinite(minorUnits)) return "";

  return (minorUnits / 100).toFixed(2);
}
