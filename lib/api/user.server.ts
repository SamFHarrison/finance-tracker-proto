import "server-only";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ServerAuthUser = {
  id: string;
  email: string | null;
};

export async function getUser(): Promise<ServerAuthUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

// Backward-compatible alias for existing imports.
export const getUserDetailsOnServer = getUser;
