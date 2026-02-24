import { createClient } from "@/lib/supabase/client";
import {
  compactUndefined,
  WithUndefined,
} from "../supabase/types/type-helpers";
import { ProfilePatch, ProfileRow } from "../supabase/types/types";

export type ProfilePatchInput = WithUndefined<ProfilePatch>;

export async function getProfile(userId: string): Promise<ProfileRow> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function mutateProfile(
  userId: string,
  patch: ProfilePatchInput,
): Promise<ProfileRow> {
  const supabase = createClient();
  const update = compactUndefined(patch);

  if (Object.keys(update).length === 0)
    throw new Error("No fields provided to update.");

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
