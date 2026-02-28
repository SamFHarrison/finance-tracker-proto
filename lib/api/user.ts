import { createClient } from "../supabase/client";

export async function fetchUserId(): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  return data.user?.id ?? null;
}
