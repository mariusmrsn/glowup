import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { getCharacter } from "@/server/queries/character";
import { getNotificationFeed } from "@/server/queries/notifications";
import { NotificationsClient } from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, feed] = await Promise.all([
    getCharacter(session.user.id),
    getNotificationFeed(session.user.id),
  ]);

  const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

  return (
    <div>
      <TopBar title="Benachrichtigungen" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <NotificationsClient feed={feed} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
