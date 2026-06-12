import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Github } from "@/components/icons";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 items-center justify-center mb-4 glow-purple">
            <span className="text-3xl font-black text-white">G</span>
          </div>
          <h1 className="text-4xl font-black gradient-text">GlowUp</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Mache das echte Leben zum RPG
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 border border-white/8">
          <h2 className="text-xl font-bold text-foreground mb-1">Willkommen zurück</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Melde dich an, um weiter aufzuleveln
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Github className="w-5 h-5" />
              Mit GitHub anmelden
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Durch die Anmeldung stimmst du unseren Nutzungsbedingungen zu.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { emoji: "⚔️", label: "Attribute leveln" },
            { emoji: "🔥", label: "Streaks aufbauen" },
            { emoji: "🏆", label: "Achievements" },
          ].map(({ emoji, label }) => (
            <div
              key={label}
              className="glass-card rounded-xl p-3 text-center"
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
