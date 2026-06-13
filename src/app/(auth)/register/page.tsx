"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { registerUser } from "@/server/actions/auth";
import { BubbleAnimation } from "@/components/auth/BubbleAnimation";
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
      if (result?.error) setError(result.error);
    });
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };
  const labelClass = "block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden bg-[#0d0d18]">
      <BubbleAnimation />
      <CommunityPopup />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <Image src="/logo.svg" alt="GlowUp" width={72} height={72} />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-white/40 uppercase mb-1">GlowUp</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Konto erstellen 🚀</h1>
          <p className="text-sm text-white/40 mt-1">Starte deine Transformation noch heute</p>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-2xl p-6 shadow-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="username" className={labelClass}>Benutzername</label>
              <input id="username" name="username" type="text" autoComplete="username"
                placeholder="deinname" required minLength={2} maxLength={30}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>E-Mail</label>
              <input id="email" name="email" type="email" autoComplete="email"
                placeholder="name@beispiel.de" required
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Passwort</label>
              <input id="password" name="password" type="password" autoComplete="new-password"
                placeholder="Mindestens 6 Zeichen" required minLength={6}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="confirm" className={labelClass}>Passwort bestätigen</label>
              <input id="confirm" name="confirm" type="password" autoComplete="new-password"
                placeholder="••••••••" required
                className={inputClass} style={inputStyle} />
            </div>

            {error && (
              <p className="text-xs text-red-400 rounded-xl px-4 py-2.5"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="group w-full relative overflow-hidden flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)" }}
            >
              {!isPending && (
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />
              )}
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Erstelle Konto…</> : <>Jetzt durchstarten ✨</>}
            </button>
          </form>

          <p className="text-center text-[11px] text-white/25 mt-3">
            Mit der Registrierung stimmst du unseren{" "}
            <Link href="/nutzungsbedingungen" className="underline underline-offset-2 hover:text-white/50 transition-colors">Nutzungsbedingungen</Link>{" "}
            und der{" "}
            <Link href="/datenschutz" className="underline underline-offset-2 hover:text-white/50 transition-colors">Datenschutzerklärung</Link> zu.
          </p>
        </div>

        <p className="text-center text-sm text-white/30 mt-5">
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Einloggen →
          </Link>
        </p>

        <div className="mt-8 text-center space-y-1">
          <p className="text-xs font-semibold text-white/20 tracking-widest uppercase">MM</p>
          <p className="text-[11px] text-white/15">© {new Date().getFullYear()} GlowUp · Alle Rechte vorbehalten</p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-white/15">
            <Link href="/datenschutz" className="hover:text-white/40 transition-colors">Datenschutz</Link>
            <span>·</span>
            <Link href="/nutzungsbedingungen" className="hover:text-white/40 transition-colors">Nutzungsbedingungen</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
