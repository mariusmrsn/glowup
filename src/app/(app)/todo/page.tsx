import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter } from "@/server/queries/character";
import { getTodos } from "@/server/queries/todos";
import { TopBar } from "@/components/layout/TopBar";
import { TodoClient } from "./TodoClient";

export default async function TodoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, todos] = await Promise.all([
    getCharacter(session.user.id),
    getTodos(session.user.id),
  ]);

  return (
    <div>
      <TopBar title="To-Do Liste" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <TodoClient todos={todos} />
      </div>
    </div>
  );
}
