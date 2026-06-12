import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const supabase = createAdminClient();
          const { data: user } = await supabase
            .from("users")
            .select("id, username, email, password_hash")
            .eq("email", (credentials.email as string).toLowerCase().trim())
            .single();

          if (!user?.password_hash) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.password_hash
          );
          if (!valid) return null;

          return { id: user.id, name: user.username, email: user.email };
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      id: "demo",
      name: "Demo",
      credentials: {},
      async authorize() {
        return {
          id: "demo-user-001",
          name: "Demo Hero",
          email: "demo@glowup.app",
          image: null,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
