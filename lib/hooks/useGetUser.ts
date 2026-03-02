"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/api/user";
import { qk } from "./queryKeys";

export function useGetUser() {
  return useQuery({
    queryKey: qk.user,
    queryFn: getUser,
    staleTime: Infinity,
  });
}
