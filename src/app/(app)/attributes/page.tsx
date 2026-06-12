import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAttributes, getCharacter } from "@/server/queries/character";
import { TopBar } from "@/components/layout/TopBar";
import { AttributeCard } from "@/components/game/AttributeCard";

export default async function AttributesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, attributes] = await Promise.all([
    getCharacter(session.user.id),
    getAttributes(session.user.id),
  ]);

  return (
    <div>
      <TopBar title="Attribute" user={user} />
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground text-sm mb-6">
          Verbessere deine Attribute durch Gewohnheiten und tägliche Quests.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes.map((attr, i) => (
            <AttributeCard key={attr.id} attribute={attr} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
