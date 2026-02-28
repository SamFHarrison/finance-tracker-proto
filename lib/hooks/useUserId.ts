"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserId } from "../api/user";

export function useUserId() {
  return useQuery({
    queryKey: ["userId"],
    queryFn: fetchUserId,
    staleTime: 5 * 60_000,
  });
}
