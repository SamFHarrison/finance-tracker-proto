import { createClient } from "../supabase/client";

export type AuthUser = {
  id: string | null;
  email: string | null;
};

export async function getUser(): Promise<AuthUser> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  return {
    id: data.user?.id ?? null,
    email: data.user?.email ?? null,
  };
}
