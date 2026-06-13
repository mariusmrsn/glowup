import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCharacter } from "@/server/queries/character";
import { getUnreadCount } from "@/server/queries/notifications";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { GameOverlay } from "@/components/animations/GameOverlay";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, unreadCount] = await Promise.all([
    getCharacter(session.user.id),
    getUnreadCount(session.user.id).catch(() => 0),
  ]);

  const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

  return (
    <div className="flex min-h-screen bg-background relative">
      <AnimatedBackground />
      <Sidebar user={user} unreadCount={unreadCount} isAdmin={isAdmin} />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen relative z-10">
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <MobileNav />
      <GameOverlay />
    </div>
  );
}
