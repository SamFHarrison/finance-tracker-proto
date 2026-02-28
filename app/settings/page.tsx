import { getUserDetailsOnServer } from "@/lib/api/user.server";
import { H1, P } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export default async function Settings() {
  await getUserDetailsOnServer();

  const supabase = await createClient();
  const { data: profileData, error: profileDataError } = await supabase
    .from("profiles")
    .select();

  if (profileDataError || !profileData || profileData.length > 1) {
    return <p>There was an error</p>;
  }

  return (
    <>
      <div className="flex px-4 justify-between items-end">
        <div>
          <P isSubtext>2026</P>
          <H1>Settings</H1>
        </div>
      </div>
    </>
  );
}
