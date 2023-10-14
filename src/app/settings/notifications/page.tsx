import { Separator } from "@/components/ui/separator";
import { getAppNotificationPreferences } from "@/lib/preferences";

import { NotificationsForm } from "./NotificationsForm";

export default async function SettingsNotificationsPage() {
  const data = await getAppNotificationPreferences();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">Configure how you receive notifications.</p>
      </div>
      <Separator />
      <NotificationsForm
        defaultValues={{
          startDate: data?.startDate ? new Date(data.startDate) : new Date(),
          period: data?.period ? data.period : "weekly",
          hour: data?.hour ? data.hour : 9,
          minute: data?.minute ? data.minute : 0,
          enabled: data?.enabled ?? true,
        }}
      />
    </div>
  );
}
