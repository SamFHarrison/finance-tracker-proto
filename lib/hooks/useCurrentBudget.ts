"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentBudget } from "@/lib/api/currentBudget";

export function useCurrentBudget() {
  return useQuery({
    queryKey: ["currentBudget"],
    queryFn: () => getCurrentBudget(),
    staleTime: 60_000, // budget row doesn't change often
  });
}
