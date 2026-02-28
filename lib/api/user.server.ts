import { createClient as createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUserDetailsOnServer() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return data.claims;
}
