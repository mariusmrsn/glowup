"use client";

import { useEffect, useState } from "react";
import { X, Share, Plus } from "lucide-react";

const STORAGE_KEY = "glowup_pwa_dismissed";

type Platform = "ios" | "android" | null;

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return null;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const p = detectPlatform();
    if (!p) return;
    setPlatform(p);

    if (p === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setVisible(true);
      };
      window.addEventListener("beforeinstallprompt", handler as EventListener);
      return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
    } else {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  async function installAndroid() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-white/10 bg-[#111118]/95 backdrop-blur-md shadow-2xl p-4">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-white/40 hover:text-white/70 transition-colors"
          aria-label="Schließen"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-4">
          {/* Logo */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-[#111118] border border-white/10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="GlowUp" width={32} height={32} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight">Als App installieren</p>
            <p className="text-white/50 text-xs mt-0.5 leading-snug">
              Immer griffbereit — direkt vom Homebildschirm starten
            </p>
          </div>
        </div>

        <div className="mt-3">
          {platform === "ios" ? (
            <p className="text-white/60 text-xs leading-relaxed flex items-center gap-1 flex-wrap">
              Tippe auf
              <span className="inline-flex items-center gap-0.5 bg-white/10 rounded px-1.5 py-0.5 text-white font-medium">
                <Share size={11} /> Teilen
              </span>
              und dann
              <span className="inline-flex items-center gap-0.5 bg-white/10 rounded px-1.5 py-0.5 text-white font-medium">
                <Plus size={11} /> Zum Homebildschirm
              </span>
            </p>
          ) : (
            <button
              onClick={installAndroid}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold py-2 transition-colors"
            >
              Installieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
