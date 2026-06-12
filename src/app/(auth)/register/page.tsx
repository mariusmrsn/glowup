"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { registerUser } from "@/server/actions/auth";

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-500 items-center justify-center mb-5 shadow-lg">
            <span className="text-2xl font-black text-white">G</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Konto erstellen</h1>
          <p className="text-sm text-muted-foreground mt-1">Starte dein GlowUp-Abenteuer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@beispiel.de"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-1.5">
              Passwort bestätigen
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Erstelle Konto..." : "Registrieren"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Einloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
