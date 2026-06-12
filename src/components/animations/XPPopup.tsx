"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { XpPopup } from "@/types";

interface XPPopupLayerProps {
  popups: XpPopup[];
  onRemove: (id: string) => void;
}

export function XPPopupLayer({ popups, onRemove }: XPPopupLayerProps) {
  return (
    <div className="fixed bottom-24 right-6 z-50 pointer-events-none flex flex-col-reverse gap-2">
      <AnimatePresence>
        {popups.map((popup) => (
          <XPPopupItem key={popup.id} popup={popup} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function XPPopupItem({
  popup,
  onRemove,
}: {
  popup: XpPopup;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(popup.id), 1000);
    return () => clearTimeout(t);
  }, [popup.id, onRemove]);

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -40, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-sm font-bold text-indigo-400 drop-shadow-lg"
    >
      +{popup.amount} XP
    </motion.div>
  );
}
