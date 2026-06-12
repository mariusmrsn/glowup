"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function updateProfile(data: {
  username?: string;
  avatar_url?: string;
  title?: string;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();
  await supabase.from("users").update(data).eq("id", session.user.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
