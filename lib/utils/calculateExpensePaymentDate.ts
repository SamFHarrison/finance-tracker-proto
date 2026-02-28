// TODO: maybe turn this into an RPC ?

/**
 * Calculate an expense payment_date (YYYY-MM-DD) from a user-chosen day-of-month,
 * ensuring the resulting date falls inside the budget cycle:
 * [periodStart, nextPeriodStart).
 *
 * periodStart: budget.period_start (YYYY-MM-DD)
 * monthStartDay: profile.month_start_day (1..31) used to compute cycle boundaries
 * paymentDay: user input day-of-month (1..31)
 */
export function computePaymentDateForCycle(opts: {
  periodStart: string; // YYYY-MM-DD
  monthStartDay: number; // 1..31 (your cycle start-day setting)
  paymentDay: number; // 1..31 (user input)
}): string {
  const { periodStart, monthStartDay, paymentDay } = opts;

  const startDay = clampInt(monthStartDay, 1, 31);
  const payDay = clampInt(paymentDay, 1, 31);

  const start = parseIsoDate(periodStart);

  // Compute the next cycle start using the same rule (mirrors your SQL compute_period_start behavior)
  const nextStart = computeNextPeriodStart(start, startDay);

  // Two candidate months: month containing periodStart, and the next month.
  const c1 = makeClampedDate(start.getFullYear(), start.getMonth(), payDay);
  const nextMonth = addMonths(
    new Date(start.getFullYear(), start.getMonth(), 1),
    1,
  );
  const c2 = makeClampedDate(
    nextMonth.getFullYear(),
    nextMonth.getMonth(),
    payDay,
  );

  // Choose whichever candidate falls within [start, nextStart).
  // In most cycles, exactly one of these will fit.
  if (isInRange(c1, start, nextStart)) return formatIsoDate(c1);
  if (isInRange(c2, start, nextStart)) return formatIsoDate(c2);

  // Fallback (should be rare): pick the first candidate after start, else clamp to start.
  const chosen = c1 >= start ? c1 : c2 >= start ? c2 : start;
  return formatIsoDate(chosen);
}

/* ---------------- helpers ---------------- */

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function parseIsoDate(s: string): Date {
  // Interpret as local date at midnight to avoid timezone shifts.
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Invalid ISO date: ${s}`);
  return new Date(y, m - 1, d);
}

function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysInMonth(year: number, monthIndex0: number): number {
  // monthIndex0: 0..11
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function makeClampedDate(
  year: number,
  monthIndex0: number,
  dayOfMonth: number,
): Date {
  const dim = daysInMonth(year, monthIndex0);
  const d = Math.min(dayOfMonth, dim);
  return new Date(year, monthIndex0, d);
}

function addMonths(d: Date, months: number): Date {
  const year = d.getFullYear();
  const month = d.getMonth() + months;
  return new Date(year, month, 1);
}

function isInRange(d: Date, start: Date, endExclusive: Date): boolean {
  return d.getTime() >= start.getTime() && d.getTime() < endExclusive.getTime();
}

/**
 * Compute the next cycle start date given the current cycle start and the startDay rule.
 * Equivalent to: compute_period_start(first day of next month relative to current start, startDay)
 */
function computeNextPeriodStart(
  currentPeriodStart: Date,
  startDay: number,
): Date {
  const monthFirst = new Date(
    currentPeriodStart.getFullYear(),
    currentPeriodStart.getMonth(),
    1,
  );
  const nextMonthFirst = addMonths(monthFirst, 1); // first of next month
  return computePeriodStart(nextMonthFirst, startDay);
}

/**
 * JS version of your SQL compute_period_start(p_date, p_start_day)
 * (clamps startDay to last day of month)
 */
function computePeriodStart(pDate: Date, pStartDay: number): Date {
  const startDay = clampInt(pStartDay, 1, 31);

  const monthFirst = new Date(pDate.getFullYear(), pDate.getMonth(), 1);
  const monthLastDay = daysInMonth(pDate.getFullYear(), pDate.getMonth());
  const candidate = new Date(
    monthFirst.getFullYear(),
    monthFirst.getMonth(),
    Math.min(startDay, monthLastDay),
  );

  // If pDate >= candidate, candidate is the period start
  if (pDate.getTime() >= candidate.getTime()) return candidate;

  // Otherwise period start is candidate in previous month
  const prevMonthFirst = addMonths(monthFirst, -1);
  const prevMonthLastDay = daysInMonth(
    prevMonthFirst.getFullYear(),
    prevMonthFirst.getMonth(),
  );
  return new Date(
    prevMonthFirst.getFullYear(),
    prevMonthFirst.getMonth(),
    Math.min(startDay, prevMonthLastDay),
  );
}
