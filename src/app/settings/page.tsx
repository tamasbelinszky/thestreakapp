import { getPreference } from "@/lib/preferences";

import { PreferenceForm } from "./PreferenceForm";

export default async function SettingsPage() {
  const data = await getPreference();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Preference</h3>
        <p className="text-sm text-muted-foreground">Change your profile settings</p>
      </div>
      <PreferenceForm
        acceptsAppNotifications={data.data?.acceptsAppNotifications ?? true}
        acceptsStreakNotifications={data.data?.acceptsStreakNotifications ?? true}
        timezone={data.data?.timezone ?? "Europe/Budapest"}
      />
    </div>
  );
}
