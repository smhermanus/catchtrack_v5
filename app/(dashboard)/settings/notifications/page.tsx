import { Metadata } from "next";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { NotificationPreferences } from "@/components/dashboard/settings/notification-preferences";

export const metadata: Metadata = {
  title: "Notification Settings | CatchTrack",
  description: "Manage your notification preferences",
};

export default async function NotificationSettingsPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notification Settings</h2>
      </div>
      <div className="grid gap-4">
        <NotificationPreferences userId={user.id} />
      </div>
    </div>
  );
}
