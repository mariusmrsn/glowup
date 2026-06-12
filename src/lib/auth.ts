import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { createAdminClient } from "@/lib/supabase/server";
import { getLevelFromXp } from "@/lib/xp";
import { getRankFromLevel } from "@/lib/ranks";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    async signIn({ user }) {
      if (!user.email || !user.id) return false;
      try {
        const supabase = createAdminClient();
        const username =
          user.name?.replace(/\s+/g, "").toLowerCase() ??
          user.email.split("@")[0] ??
          `user_${Date.now()}`;

        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          const level = getLevelFromXp(0);
          const rank = getRankFromLevel(level);
          await supabase.from("users").insert({
            id: user.id,
            username,
            email: user.email,
            avatar_url: user.image ?? null,
            level,
            total_xp: 0,
            rank,
          });
        }
      } catch {
        // Non-fatal — user row may already exist or DB not configured
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
