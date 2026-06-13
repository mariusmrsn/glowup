"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, CheckCircle2, Circle, Target } from "lucide-react";
import { toast } from "sonner";
import { toggleGoalComplete, deleteGoal } from "@/server/actions/goals";
import type { Goal } from "@/server/queries/goals";
import { CreateGoalDialog } from "@/components/game/CreateGoalDialog";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getCountdown(targetDate: string): Countdown {
  const target = new Date(targetDate + "T23:59:59");
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isPast: false };
}

function CountdownDisplay({ targetDate, isCompleted }: { targetDate: string; isCompleted: boolean }) {
  const [cd, setCd] = useState<Countdown>(() => getCountdown(targetDate));

  useEffect(() => {
    if (isCompleted) return;
    const id = setInterval(() => setCd(getCountdown(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate, isCompleted]);

  if (isCompleted) {
    return <span className="text-xs font-semibold text-emerald-500">✓ Abgeschlossen</span>;
  }

  if (cd.isPast) {
    return <span className="text-xs font-semibold text-red-500">Abgelaufen</span>;
  }

  const units = [
    { value: cd.days, label: "T" },
    { value: cd.hours, label: "Std" },
    { value: cd.minutes, label: "Min" },
    { value: cd.seconds, label: "Sek" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {units.map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="tabular-nums font-bold text-sm text-foreground leading-none">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</div>
        </div>
      ))}
    </div>
  );
}

function urgencyColor(targetDate: string): string {
  const days = Math.floor((new Date(targetDate + "T23:59:59").getTime() - Date.now()) / 86_400_000);
  if (days < 7) return "from-red-500/15 to-orange-500/10 border-red-400/20";
  if (days < 30) return "from-amber-500/15 to-yellow-500/10 border-amber-400/20";
  return "from-indigo-500/10 to-violet-500/10 border-indigo-400/20";
}

function GoalCard({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleGoalComplete(goal.id, !goal.is_completed);
        toast.success(goal.is_completed ? "Ziel wieder aktiv" : "Ziel abgehakt! 🎉");
      } catch {
        toast.error("Fehler");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Ziel wirklich löschen?")) return;
    startDeleting(async () => {
      try {
        await deleteGoal(goal.id);
        toast.success("Ziel gelöscht");
      } catch {
        toast.error("Fehler");
      }
    });
  };

  const formattedDate = new Date(goal.target_date + "T00:00:00").toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: goal.is_completed ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative rounded-2xl border bg-gradient-to-br p-4 transition-all ${
        goal.is_completed
          ? "from-secondary/60 to-secondary/40 border-border"
          : urgencyColor(goal.target_date)
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Emoji */}
        <div className="text-3xl shrink-0 mt-0.5">{goal.emoji}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`font-bold text-base leading-tight ${goal.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {goal.title}
              </h3>
              {goal.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{goal.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleToggle}
                disabled={isPending}
                title={goal.is_completed ? "Reaktivieren" : "Abschließen"}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              >
                {goal.is_completed
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <Circle className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Löschen"
                className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <p className="text-[11px] text-muted-foreground">📅 {formattedDate}</p>
            <CountdownDisplay targetDate={goal.target_date} isCompleted={goal.is_completed} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function GoalsClient({ goals }: { goals: Goal[] }) {
  const active = goals.filter((g) => !g.is_completed);
  const completed = goals.filter((g) => g.is_completed);

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h3 className="font-bold text-lg text-foreground mb-2">Noch keine Ziele gesetzt</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Setze dir ein Ziel mit einem Datum — und beobachte, wie der Countdown tickt.
        </p>
        <CreateGoalDialog />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Aktive Ziele ({active.length})
          </p>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {active.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Abgeschlossen ({completed.length})
          </p>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {completed.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
