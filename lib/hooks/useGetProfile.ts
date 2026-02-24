"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/api/profile";
import { qk } from "./queryKeys";

export function useGetProfile(userId: string | null | undefined) {
  return useQuery({
    queryKey: userId ? qk.profile(userId) : ["profile", "no-user"],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });
}
