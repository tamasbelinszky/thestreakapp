import { getNamePreference } from "@/lib/preferences";

import { ProfileForm } from "./ProfileForm";

export default async function SettingsPage() {
  const data = await getNamePreference();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">Change your profile settings</p>
      </div>
      <ProfileForm firstName={data.firstName} lastName={data.lastName} />
    </div>
  );
}
