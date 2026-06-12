import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCharacter } from "@/server/queries/character";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GameOverlay } from "@/components/animations/GameOverlay";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getCharacter(session.user.id);

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <MobileNav />
      <GameOverlay />
    </div>
  );
}
