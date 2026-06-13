"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send, CheckCircle2, Loader2 } from "lucide-react";

const SUBJECTS = [
  "Konto löschen",
  "Meine Daten löschen (DSGVO)",
  "Daten exportieren",
  "Passwort vergessen / Konto gesperrt",
  "Fehler melden",
  "Sonstiges",
];

export default function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Fehler");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.svg" alt="GlowUp" width={36} height={36} />
          <div>
            <h1 className="text-2xl font-black">Kontakt & Anfragen</h1>
            <p className="text-sm text-muted-foreground">Wir antworten innerhalb von 48 Stunden.</p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Anfrage gesendet!</h2>
            <p className="text-sm text-muted-foreground">
              Wir haben deine Nachricht erhalten und melden uns so schnell wie möglich bei dir.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-2 text-sm text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              ← Zurück zur App
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Name"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  E-Mail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Anliegen *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      subject === s
                        ? "bg-indigo-500 border-indigo-500 text-white"
                        : "border-border text-muted-foreground hover:border-indigo-400 hover:text-indigo-500"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="oder eigenes Anliegen eingeben…"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Nachricht *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Beschreibe dein Anliegen so genau wie möglich. Bei Datenlöschung: gib deinen Benutzernamen an."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 rounded-xl px-4 py-2.5 bg-red-500/10 border border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Wird gesendet…" : "Anfrage senden"}
            </button>

            <p className="text-[11px] text-center text-muted-foreground">
              Mit dem Absenden stimmst du unserer{" "}
              <Link href="/datenschutz" className="underline hover:text-foreground transition-colors">
                Datenschutzerklärung
              </Link>{" "}
              zu.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
