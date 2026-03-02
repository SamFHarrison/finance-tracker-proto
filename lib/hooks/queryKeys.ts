export const qk = {
  user: ["user"] as const,
  expenses: (budgetId: string) => ["expenses", budgetId] as const,
  income: (budgetId: string) => ["income", budgetId] as const,
  budgetSummary: (budgetId: string) => ["budgetSummary", budgetId] as const,
  profile: (userId: string) => ["profile", userId] as const,
};
