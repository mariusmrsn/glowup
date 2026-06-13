"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: "spring" as const, delay } },
});

export function CommunityPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden max-w-sm w-full"
        showCloseButton={false}
      >
        {/* Banner */}
        <div
          className="relative h-44 w-full flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)",
          }}
        >
          <div className="absolute w-48 h-48 rounded-full bg-white/5 -top-12 -left-12" />
          <div className="absolute w-36 h-36 rounded-full bg-white/5 -bottom-10 right-2" />
          <div className="relative z-10 text-center">
            <span className="text-5xl block mb-2">🔥</span>
            <p className="text-white font-bold text-lg tracking-tight">GlowUp Community</p>
            <p className="text-white/60 text-xs mt-0.5">Werde Teil der Bewegung</p>
          </div>
          <DialogClose className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer text-sm">
            ✕
          </DialogClose>
        </div>

        {/* Body */}
        <div className="p-6">
          <motion.div {...fadeUp(0.08)}>
            <DialogTitle className="text-[17px] font-bold text-foreground leading-snug">
              Du machst nicht nur Sport.<br />
              <span className="text-indigo-400">Du wirst jemand.</span>
            </DialogTitle>
          </motion.div>

          <motion.div {...fadeUp(0.16)}>
            <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
              GlowUp ist mehr als eine App — es ist eine Gemeinschaft von Menschen, die täglich besser werden.
            </DialogDescription>
          </motion.div>

          {/* Perks */}
          <motion.div {...fadeUp(0.24)} className="space-y-2 mt-4">
            {[
              { icon: "📸", label: "Teile deine Resultate", desc: "Zeige Fortschritte & inspire andere" },
              { icon: "👥", label: "Freunde einladen", desc: "Lass dein Umfeld an deinem Wachstum teilhaben" },
              { icon: "⚡", label: "Täglich motiviert bleiben", desc: "Challenges & Streaks gemeinsam meistern" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/60">
                <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp(0.32)} className="flex items-center justify-around py-3 border-y border-border my-4">
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">2.4k+</p>
              <p className="text-[11px] text-muted-foreground">Mitglieder</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">89%</p>
              <p className="text-[11px] text-muted-foreground">täglich aktiv</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">⭐ 4.9</p>
              <p className="text-[11px] text-muted-foreground">Bewertung</p>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div {...fadeUp(0.40)} className="flex gap-2">
            <a
              href="https://discord.gg/ERtere3Uy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all active:scale-[0.98]"
            >
              💬 Discord
            </a>
            <DialogClose className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground font-medium text-sm transition-all active:scale-[0.98] cursor-pointer">
              Klingt gut 🚀
            </DialogClose>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
