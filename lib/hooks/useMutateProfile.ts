"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateProfile, type ProfilePatchInput } from "@/lib/api/profile";
import { qk } from "./queryKeys";

export function useMutateProfile(userId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { patch: ProfilePatchInput }) =>
      mutateProfile(userId, vars.patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.profile(userId) });
    },
  });
}
