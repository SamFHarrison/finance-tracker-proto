import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setNextMonthStartDay } from "../api/setNextMonthStartDay";
import { qk } from "./queryKeys";

export function useSetNextMonthStartDay(userId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (day: number) => setNextMonthStartDay(day),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.profile(userId) });
      // current budget shouldn't change immediately by design
      // but I'm trying to keep things consistent
      await qc.invalidateQueries({ queryKey: ["currentBudget"] });
    },
  });
}
