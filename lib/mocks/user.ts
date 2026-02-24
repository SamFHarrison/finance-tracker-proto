export type AppTheme = "system" | "light" | "dark";
export type ExpenseCategory =
  | "essential"
  | "debt"
  | "luxuries"
  | "variable"
  | "savings_and_investments";

export type Profile = {
  user_id: string;
  display_name: string | null;
  preferred_currency: "GBP";
  month_start_day: number; // 1-31
  preferred_app_theme: AppTheme;
  created_at: string; // ISO
  updated_at: string; // ISO
};

export type Budget = {
  id: string;
  user_id: string;
  created_at: string; // ISO
  period_start: string; // YYYY-MM-DD
};

export type Income = {
  id: string;
  budget_id: string;
  created_at: string; // ISO
  name: string;
  amount_pence: number;
  is_monthly: boolean;
};

export type Expense = {
  id: string;
  budget_id: string;
  created_at: string; // ISO
  name: string;
  amount_pence: number;
  category: ExpenseCategory;
  payment_date: string; // YYYY-MM-DD
  is_paid: boolean;
};

// -------------------- One Mock User --------------------

export const MOCK_USER_ID = "11111111-1111-1111-1111-111111111111";

export const MOCK_PROFILE: Profile = {
  user_id: MOCK_USER_ID,
  display_name: "Sam Dev",
  preferred_currency: "GBP",
  month_start_day: 25, // custom cycle start day (clamp handled in your budget-period logic)
  preferred_app_theme: "system",
  created_at: "2026-01-05T10:12:00.000Z",
  updated_at: "2026-01-05T10:12:00.000Z",
};

// Two cycles: 25 Jan–24 Feb, and 25 Feb–24 Mar (you compute end date in UI)
export const MOCK_BUDGET_CURRENT: Budget = {
  id: "b-sam-2026-02-25",
  user_id: MOCK_USER_ID,
  created_at: "2026-02-25T00:00:00.000Z",
  period_start: "2026-02-25",
};

export const MOCK_BUDGET_PREVIOUS: Budget = {
  id: "b-sam-2026-01-25",
  user_id: MOCK_USER_ID,
  created_at: "2026-01-25T00:00:00.000Z",
  period_start: "2026-01-25",
};

export const MOCK_BUDGETS: Budget[] = [
  MOCK_BUDGET_PREVIOUS,
  MOCK_BUDGET_CURRENT,
];

// -------------------- Income --------------------

export const MOCK_INCOME_CURRENT: Income[] = [
  {
    id: "i-sam-salary-2026-02-25",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-02-25T09:00:00.000Z",
    name: "Salary",
    amount_pence: 260000, // £2,600.00
    is_monthly: true,
  },
  {
    id: "i-sam-oneoff-2026-03-02",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-03-02T12:00:00.000Z",
    name: "Sold old phone",
    amount_pence: 8500, // £85.00
    is_monthly: false,
  },
];

export const MOCK_INCOME_PREVIOUS: Income[] = [
  {
    id: "i-sam-salary-2026-01-25",
    budget_id: MOCK_BUDGET_PREVIOUS.id,
    created_at: "2026-01-25T09:00:00.000Z",
    name: "Salary",
    amount_pence: 260000,
    is_monthly: true,
  },
  {
    id: "i-sam-oneoff-2026-02-02",
    budget_id: MOCK_BUDGET_PREVIOUS.id,
    created_at: "2026-02-02T12:00:00.000Z",
    name: "Freelance gig",
    amount_pence: 45000, // £450.00
    is_monthly: false,
  },
];

export const MOCK_INCOME_ALL: Income[] = [
  ...MOCK_INCOME_PREVIOUS,
  ...MOCK_INCOME_CURRENT,
];

// -------------------- Expenses --------------------
// Mix of: needs (essential + debt), wants (luxuries + variable), savings

export const MOCK_EXPENSES_CURRENT: Expense[] = [
  {
    id: "e-sam-rent-2026-02-25",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-02-25T10:00:00.000Z",
    name: "Rent",
    amount_pence: 120000,
    category: "essential",
    payment_date: "2026-02-25",
    is_paid: true,
  },
  {
    id: "e-sam-utilities-2026-03-02",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-02-26T10:00:00.000Z",
    name: "Utilities",
    amount_pence: 9800,
    category: "essential",
    payment_date: "2026-03-02",
    is_paid: false,
  },
  {
    id: "e-sam-gym-2026-03-05",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-02-26T10:15:00.000Z",
    name: "Gym membership",
    amount_pence: 2999,
    category: "variable",
    payment_date: "2026-03-05",
    is_paid: false,
  },
  {
    id: "e-sam-creditcard-2026-03-10",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-02-27T10:20:00.000Z",
    name: "Credit card payment",
    amount_pence: 18000,
    category: "debt",
    payment_date: "2026-03-10",
    is_paid: false,
  },
  {
    id: "e-sam-groceries-2026-03-07",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-02-28T10:00:00.000Z",
    name: "Groceries",
    amount_pence: 6500,
    category: "essential",
    payment_date: "2026-03-07",
    is_paid: true,
  },
  {
    id: "e-sam-takeaway-2026-03-08",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-03-01T18:30:00.000Z",
    name: "Takeaway",
    amount_pence: 2100,
    category: "luxuries",
    payment_date: "2026-03-08",
    is_paid: false,
  },
  {
    id: "e-sam-savings-2026-03-15",
    budget_id: MOCK_BUDGET_CURRENT.id,
    created_at: "2026-03-02T10:00:00.000Z",
    name: "Index fund",
    amount_pence: 30000,
    category: "savings_and_investments",
    payment_date: "2026-03-15",
    is_paid: true,
  },
];

export const MOCK_EXPENSES_PREVIOUS: Expense[] = [
  {
    id: "e-sam-rent-2026-01-25",
    budget_id: MOCK_BUDGET_PREVIOUS.id,
    created_at: "2026-01-25T10:00:00.000Z",
    name: "Rent",
    amount_pence: 120000,
    category: "essential",
    payment_date: "2026-01-25",
    is_paid: true,
  },
  {
    id: "e-sam-council-tax-2026-02-01",
    budget_id: MOCK_BUDGET_PREVIOUS.id,
    created_at: "2026-01-27T10:00:00.000Z",
    name: "Council tax",
    amount_pence: 14500,
    category: "essential",
    payment_date: "2026-02-01",
    is_paid: true,
  },
  {
    id: "e-sam-phone-2026-02-03",
    budget_id: MOCK_BUDGET_PREVIOUS.id,
    created_at: "2026-02-01T10:00:00.000Z",
    name: "Phone bill",
    amount_pence: 2400,
    category: "essential",
    payment_date: "2026-02-03",
    is_paid: true,
  },
  {
    id: "e-sam-cinema-2026-02-12",
    budget_id: MOCK_BUDGET_PREVIOUS.id,
    created_at: "2026-02-06T10:00:00.000Z",
    name: "Cinema",
    amount_pence: 1400,
    category: "luxuries",
    payment_date: "2026-02-12",
    is_paid: true,
  },
  {
    id: "e-sam-dining-2026-02-14",
    budget_id: MOCK_BUDGET_PREVIOUS.id,
    created_at: "2026-02-07T10:00:00.000Z",
    name: "Dining out",
    amount_pence: 3200,
    category: "luxuries",
    payment_date: "2026-02-14",
    is_paid: false,
  },
  {
    id: "e-sam-index-fund-2026-02-20",
    budget_id: MOCK_BUDGET_PREVIOUS.id,
    created_at: "2026-02-08T10:00:00.000Z",
    name: "Index fund",
    amount_pence: 30000,
    category: "savings_and_investments",
    payment_date: "2026-02-20",
    is_paid: true,
  },
];

export const MOCK_EXPENSES_ALL: Expense[] = [
  ...MOCK_EXPENSES_PREVIOUS,
  ...MOCK_EXPENSES_CURRENT,
];

// -------------------- Page-shaped bundles --------------------
// These are the ones you actually pass to components.

export const MOCK_CURRENT_BUDGET_PAGE = {
  profile: MOCK_PROFILE,
  budget: MOCK_BUDGET_CURRENT,
  income: MOCK_INCOME_CURRENT,
  expenses: MOCK_EXPENSES_CURRENT,
} as const;

export const MOCK_PREVIOUS_BUDGET_PAGE = {
  profile: MOCK_PROFILE,
  budget: MOCK_BUDGET_PREVIOUS,
  income: MOCK_INCOME_PREVIOUS,
  expenses: MOCK_EXPENSES_PREVIOUS,
} as const;

// -------------------- Optional: computed "summary" for UI cards --------------------

export function computeSummary(input: {
  budget: Budget;
  profile: Profile;
  income: Income[];
  expenses: Expense[];
}) {
  const incomeTotal = input.income.reduce((s, i) => s + i.amount_pence, 0);
  const expenseTotal = input.expenses.reduce((s, e) => s + e.amount_pence, 0);
  const stillToPay = input.expenses
    .filter((e) => !e.is_paid)
    .reduce((s, e) => s + e.amount_pence, 0);

  const needs = input.expenses
    .filter((e) => e.category === "essential" || e.category === "debt")
    .reduce((s, e) => s + e.amount_pence, 0);

  const wants = input.expenses
    .filter((e) => e.category === "luxuries" || e.category === "variable")
    .reduce((s, e) => s + e.amount_pence, 0);

  const savings = input.expenses
    .filter((e) => e.category === "savings_and_investments")
    .reduce((s, e) => s + e.amount_pence, 0);

  const pct = (x: number) =>
    incomeTotal === 0 ? null : Math.round((x / incomeTotal) * 10000) / 100;

  return {
    budget_id: input.budget.id,
    user_id: input.budget.user_id,
    period_start: input.budget.period_start,
    income_total_pence: incomeTotal,
    expense_total_pence: expenseTotal,
    still_to_pay_pence: stillToPay,
    needs_pence: needs,
    wants_pence: wants,
    savings_pence: savings,
    needs_pct_of_income: pct(needs),
    wants_pct_of_income: pct(wants),
    savings_pct_of_income: pct(savings),
  } as const;
}

export const MOCK_CURRENT_SUMMARY = computeSummary(MOCK_CURRENT_BUDGET_PAGE);
export const MOCK_PREVIOUS_SUMMARY = computeSummary(MOCK_PREVIOUS_BUDGET_PAGE);
