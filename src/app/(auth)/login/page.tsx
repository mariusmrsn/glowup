"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDemoPending, startDemoTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError("");

    startTransition(async () => {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("E-Mail oder Passwort falsch.");
      } else {
        window.location.href = "/dashboard";
      }
    });
  };

  const handleDemo = () => {
    startDemoTransition(async () => {
      await signIn("demo", { callbackUrl: "/dashboard" });
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Willkommen zurück</h1>
          <p className="text-sm text-muted-foreground mt-1">Melde dich bei GlowUp an</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Passwort
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            disabled={isPending || !email || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Einloggen
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">oder</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Demo */}
        <button
          onClick={handleDemo}
          disabled={isDemoPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isDemoPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>⚡</span>}
          Demo ausprobieren
        </button>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
