import { auth } from "@/lib/auth";

import { ProfileForm } from "./ProfileForm";

export default async function SettingsPage() {
  const data = await auth();
  if (!data?.user) {
    return null;
  }
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-8">
      <ProfileForm name={data.user.name ?? ""} />
    </div>
  );
}
