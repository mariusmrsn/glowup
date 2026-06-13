"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoal } from "@/server/actions/goals";

const EMOJIS = ["🎯", "💪", "🏖️", "🚗", "🎓", "💰", "🏠", "✈️", "🎸", "🏆", "📚", "🧘", "🔥", "⭐", "🌱"];
const CATEGORIES = [
  { value: "fitness", label: "Fitness" },
  { value: "education", label: "Bildung" },
  { value: "finance", label: "Finanzen" },
  { value: "personal", label: "Persönlich" },
  { value: "career", label: "Karriere" },
  { value: "travel", label: "Reisen" },
  { value: "hobby", label: "Hobby" },
];

const PRESETS = [
  { title: "Sommer Body", emoji: "🏖️", category: "fitness" },
  { title: "Winter Arc", emoji: "❄️", category: "fitness" },
  { title: "Führerschein", emoji: "🚗", category: "personal" },
  { title: "Abitur bestehen", emoji: "🎓", category: "education" },
  { title: "Notfallspargroschen", emoji: "💰", category: "finance" },
  { title: "Erste eigene Wohnung", emoji: "🏠", category: "personal" },
  { title: "Auslandsreise", emoji: "✈️", category: "travel" },
  { title: "Instrument lernen", emoji: "🎸", category: "hobby" },
];

export function CreateGoalDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [category, setCategory] = useState("personal");

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0]!;

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setTitle(preset.title);
    setEmoji(preset.emoji);
    setCategory(preset.category);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;
    startTransition(async () => {
      try {
        await createGoal({ title, description, target_date: targetDate, emoji, category });
        toast.success("Ziel erstellt! 🎯");
        setOpen(false);
        setTitle(""); setDescription(""); setTargetDate(""); setEmoji("🎯"); setCategory("personal");
      } catch {
        toast.error("Fehler beim Erstellen");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm px-4 py-2 transition-colors cursor-pointer"
        render={
          <button type="button">
            <Plus className="w-4 h-4" />
            Ziel hinzufügen
          </button>
        }
      />
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Ziel setzen</DialogTitle>
        </DialogHeader>

        {/* Preset chips */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Schnellauswahl</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {p.emoji} {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <Label className="mb-2 block">Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    emoji === e ? "bg-indigo-500/20 ring-2 ring-indigo-500" : "hover:bg-secondary"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Ziel *</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Sommer Body 2025"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-desc">Beschreibung</Label>
            <Input
              id="goal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="goal-date">Datum *</Label>
              <input
                id="goal-date"
                type="date"
                value={targetDate}
                min={minDateStr}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kategorie</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending || !title.trim() || !targetDate}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            {isPending ? "Speichere..." : "Ziel speichern 🎯"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
