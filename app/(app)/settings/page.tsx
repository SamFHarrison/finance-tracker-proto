import SettingsForm from "@/components/blocks/settings-form";
import { H3, P } from "@/components/ui";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getUser } from "@/lib/api/user.server";
import { getProfile } from "@/lib/api/profile.server";

export default async function SettingsPage() {
  const user = await getUser();
  const profile = await getProfile(user.id);

  if (!profile) {
    return (
      <Empty className="mb-50 px-8">
        <EmptyHeader>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            We might be doing necessary maintenence. Please try again later.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="flex flex-col px-4 justify-between items-center">
        <P isSubtext>Your account</P>
        <H3 className="text-lg">{user.email ?? "No email"}</H3>
      </div>

      <div className="px-4">
        <div className="flex justify-between pl-2 pb-2 items-center h-12">
          <H3>Settings</H3>
        </div>

        <SettingsForm
          userId={user.id}
          displayName={profile.display_name}
          monthStartDay={profile.month_start_day}
          nextMonthStartDay={profile.next_month_start_day}
        />
      </div>
    </>
  );
}
