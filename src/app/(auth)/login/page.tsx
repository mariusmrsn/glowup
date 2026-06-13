"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { loginUser } from "@/server/actions/auth";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PaperShaderBackground } from "@/components/auth/PaperShaderBackground";

const QUOTES = [
  { text: "My attitude is that if you push me towards my weakness, I will turn that weakness into my strength.", author: "Michael Jordan", emoji: "💪" },
  { text: "Hard days are the best because that's when champions are made.", author: "Gabby Douglas", emoji: "🏆" },
  { text: "If it doesn't challenge you, it won't change you.", author: "Fred Devito", emoji: "⚡" },
  { text: "Those who don't give 100% in training won't give 100% when it matters.", author: "Michael Owen", emoji: "🎯" },
  { text: "Without courage to take risks, you achieve nothing in life.", author: "Muhammad Ali", emoji: "🦁" },
  { text: "Every champion was once a contender who refused to give up.", author: "Rocky Balboa", emoji: "🥊" },
  { text: "I can win and I can lose, but I will never be defeated.", author: "Emmitt Smith", emoji: "🛡️" },
  { text: "Never let your head hang. Never give up and don't sit and mourn. Find another way.", author: "Satchel Paige", emoji: "🚀" },
  { text: "Those who never quit are simply unbeatable.", author: "Babe Ruth", emoji: "🔥" },
  { text: "Success is where preparation and opportunity meet.", author: "Bobby Unser", emoji: "🎖️" },
  { text: "Courage doesn't mean you're not afraid. Courage means you don't let fear hold you back.", author: "Bethany Hamilton", emoji: "❤️" },
  { text: "You can't limit anything. The more you dream, the further you'll go.", author: "Michael Phelps", emoji: "🌟" },
  { text: "The road to success goes uphill.", author: "Willie Davis", emoji: "⛰️" },
  { text: "Most of us never run far enough on our first wind to discover we've got a second.", author: "William James", emoji: "💨" },
  { text: "The difference between the impossible and the possible lies in determination.", author: "Usain Bolt", emoji: "⚡" },
  { text: "Find the good. It's everywhere. Find it, show it, and you'll start believing it.", author: "Jesse Owens", emoji: "✨" },
  { text: "For me, team comes first. That's what allows me to succeed.", author: "LeBron James", emoji: "🤝" },
  { text: "Each of us has a fire in our heart for something. Find it and keep it burning.", author: "Mary Lou Retton", emoji: "🔥" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", emoji: "💪" },
  { text: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong", emoji: "🚴" },
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill", emoji: "🧠" },
  { text: "It never gets easier. You just get stronger.", author: "Anonymous", emoji: "💥" },
  { text: "Don't wish for it. Work for it.", author: "Anonymous", emoji: "🎯" },
  { text: "Don't let what you can't control distract you from what you can.", author: "John Wooden", emoji: "🎯" },
];

export default function LoginPage() {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Date.now() / 86_400_000) % QUOTES.length);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDemoPending, startDemoTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("error");
    if (e === "CredentialsSignin") setError("E-Mail oder Passwort falsch.");
    else if (e) setError(`Login-Fehler (${e}) — bitte Seite neu laden.`);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const quote = QUOTES[quoteIndex]!;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email.toLowerCase().trim());
      formData.append("password", password);
      const result = await loginUser(formData);
      if (result?.error) setError(result.error);
    });
  };

  const handleDemo = () => {
    startDemoTransition(async () => {
      await signIn("demo", { callbackUrl: "/dashboard" });
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
         style={{ background: "#0d0d18" }}>

      <PaperShaderBackground />

      <div className="w-full max-w-sm flex flex-col items-center" style={{ position: "relative", zIndex: 10 }}>

        {/* Logo */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center mb-4">
            <Image src="/logo.svg" alt="GlowUp" width={88} height={88} />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-white/40 uppercase mb-2">GlowUp</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Willkommen zurück 👋</h1>
        </div>

        {/* Animated quote */}
        <div className="text-center mb-6 px-2 h-[72px] flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-center"
            >
              <span className="text-xl block mb-1.5">{quote.emoji}</span>
              <p className="text-sm text-white/60 italic leading-relaxed">
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-xs text-white/30 mt-1">— {quote.author}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl p-6 shadow-2xl"
             style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
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
                className="w-full px-4 py-2.5 rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 rounded-xl px-4 py-2.5"
                 style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-1"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Einloggen 🔑
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-[11px] text-white/25">oder</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          <button
            onClick={handleDemo}
            disabled={isDemoPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/50 hover:text-white/80 font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {isDemoPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>⚡</span>}
            Demo ausprobieren
          </button>
        </div>

        <p className="text-center text-sm text-white/30 mt-5">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Jetzt registrieren →
          </Link>
        </p>

        {/* Footer */}
        <div className="mt-10 text-center space-y-1">
          <p className="text-xs font-semibold text-white/20 tracking-widest uppercase">MM</p>
          <p className="text-[11px] text-white/15">
            © {new Date().getFullYear()} GlowUp · Alle Rechte vorbehalten
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-white/15">
            <Link href="/datenschutz" className="hover:text-white/40 transition-colors">Datenschutz</Link>
            <span>·</span>
            <Link href="/nutzungsbedingungen" className="hover:text-white/40 transition-colors">Nutzungsbedingungen</Link>
            <span>·</span>
            <Link href="/kontakt" className="hover:text-white/40 transition-colors">Kontakt & Anfragen</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
