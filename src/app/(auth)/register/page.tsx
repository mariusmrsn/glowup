"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { registerUser } from "@/server/actions/auth";
import { ActivityBackground } from "@/components/auth/ActivityBackground";
import { CommunityPopup } from "@/components/auth/CommunityPopup";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    startTransition(async () => {
      const result = await registerUser(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 relative">
      <ActivityBackground />

      {/* Community popup appears after 1.8s */}
      <CommunityPopup />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center mb-3">
            <Image src="/logo.svg" alt="GlowUp" width={52} height={52} />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-1">GlowUp</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Konto erstellen 🚀</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Starte deine Transformation noch heute</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="deinname"
                required
                minLength={2}
                maxLength={30}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@beispiel.de"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mindestens 6 Zeichen"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Passwort bestätigen
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/15 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Animated CTA button */}
            <div className="relative mt-1">
              <button
                type="submit"
                disabled={isPending}
                className="group w-full relative overflow-hidden flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: isPending
                    ? "oklch(0.585 0.233 264.376)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                  color: "white",
                }}
              >
                {/* Shine sweep */}
                {!isPending && (
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />
                )}
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Erstelle Konto…</>
                ) : (
                  <>Jetzt durchstarten ✨</>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-[11px] text-muted-foreground/50 mt-3">
            Mit der Registrierung stimmst du unseren{" "}
            <Link href="/nutzungsbedingungen" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">Nutzungsbedingungen</Link>{" "}
            und der{" "}
            <Link href="/datenschutz" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">Datenschutzerklärung</Link>{" "}
            zu.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Einloggen →
          </Link>
        </p>

        {/* Footer */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-xs font-semibold text-muted-foreground/60 tracking-widest uppercase">MM</p>
          <p className="text-[11px] text-muted-foreground/40">
            © {new Date().getFullYear()} GlowUp · Alle Rechte vorbehalten
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground/40">
            <Link href="/datenschutz" className="hover:text-muted-foreground transition-colors">Datenschutz</Link>
            <span>·</span>
            <Link href="/nutzungsbedingungen" className="hover:text-muted-foreground transition-colors">Nutzungsbedingungen</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
