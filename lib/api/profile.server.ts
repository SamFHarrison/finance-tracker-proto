import "server-only";

import { createClient } from "@/lib/supabase/server";
import { ProfileRow } from "../supabase/types/types";

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
