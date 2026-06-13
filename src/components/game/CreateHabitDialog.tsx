"use client";

import { useState, useTransition } from "react";
import { Plus, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHabit } from "@/server/actions/habits";
import { ATTRIBUTE_META } from "@/types";
import type { AttributeType, HabitFrequency } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

function xpForDuration(mins: number): number {
  if (mins <= 0) return 30;
  if (mins <= 5) return 45; if (mins <= 10) return 60; if (mins <= 15) return 70;
  if (mins <= 20) return 80; if (mins <= 30) return 95; if (mins <= 45) return 115;
  if (mins <= 60) return 140; if (mins <= 90) return 170; if (mins <= 120) return 200;
  return 240;
}

const ATTRIBUTE_OPTIONS = Object.entries(ATTRIBUTE_META) as [
  AttributeType,
  (typeof ATTRIBUTE_META)[AttributeType],
][];

interface Suggestion {
  name: string;
  attribute: AttributeType;
  xp: number;
  emoji: string;
}

const SUGGESTIONS: Record<string, { label: string; emoji: string; items: Suggestion[] }> = {
  fitness: {
    label: "Fitness",
    emoji: "💪",
    items: [
      { name: "30 Min Sport", attribute: "strength", xp: 80, emoji: "🏋️" },
      { name: "10.000 Schritte gehen", attribute: "strength", xp: 60, emoji: "🚶" },
      { name: "5 km laufen", attribute: "strength", xp: 100, emoji: "🏃" },
      { name: "Push-ups täglich", attribute: "strength", xp: 50, emoji: "💪" },
      { name: "Yoga oder Dehnen", attribute: "health", xp: 50, emoji: "🧘" },
      { name: "Kalt duschen", attribute: "discipline", xp: 60, emoji: "🚿" },
    ],
  },
  gesundheit: {
    label: "Gesundheit",
    emoji: "🏥",
    items: [
      { name: "2 Liter Wasser trinken", attribute: "health", xp: 40, emoji: "💧" },
      { name: "8 Stunden schlafen", attribute: "health", xp: 60, emoji: "😴" },
      { name: "Kein Zucker heute", attribute: "health", xp: 70, emoji: "🚫🍬" },
      { name: "Gemüse essen", attribute: "health", xp: 40, emoji: "🥗" },
      { name: "Meditation", attribute: "health", xp: 50, emoji: "🧘" },
      { name: "Vitamine nehmen", attribute: "health", xp: 30, emoji: "💊" },
    ],
  },
  lernen: {
    label: "Schule / Uni",
    emoji: "🎓",
    items: [
      { name: "30 Min lesen", attribute: "intelligence", xp: 60, emoji: "📚" },
      { name: "Hausaufgaben erledigen", attribute: "intelligence", xp: 70, emoji: "📝" },
      { name: "Karteikarten lernen", attribute: "intelligence", xp: 60, emoji: "🗂️" },
      { name: "Zusammenfassung schreiben", attribute: "intelligence", xp: 80, emoji: "✍️" },
      { name: "Podcast auf Englisch", attribute: "intelligence", xp: 50, emoji: "🎧" },
      { name: "Online-Kurs Lektion", attribute: "intelligence", xp: 70, emoji: "💻" },
      { name: "Mathe üben", attribute: "intelligence", xp: 80, emoji: "🔢" },
      { name: "Vokabeln lernen", attribute: "intelligence", xp: 50, emoji: "🔤" },
    ],
  },
  finanzen: {
    label: "Finanzen",
    emoji: "💰",
    items: [
      { name: "Ausgaben tracken", attribute: "economy", xp: 50, emoji: "📊" },
      { name: "10€ sparen", attribute: "economy", xp: 60, emoji: "💵" },
      { name: "Budget prüfen", attribute: "economy", xp: 40, emoji: "📋" },
      { name: "Investition recherchieren", attribute: "economy", xp: 70, emoji: "📈" },
      { name: "Unnötige Ausgabe canceln", attribute: "economy", xp: 80, emoji: "✂️" },
    ],
  },
  soziales: {
    label: "Soziales",
    emoji: "👥",
    items: [
      { name: "Freund anrufen", attribute: "social", xp: 50, emoji: "📞" },
      { name: "Netten Kommentar schreiben", attribute: "social", xp: 30, emoji: "💬" },
      { name: "Familie Zeit widmen", attribute: "social", xp: 60, emoji: "👨‍👩‍👧" },
      { name: "Neuen Menschen kennenlernen", attribute: "social", xp: 80, emoji: "🤝" },
      { name: "Hilfreich sein", attribute: "social", xp: 50, emoji: "🙌" },
    ],
  },
  disziplin: {
    label: "Disziplin / Todo",
    emoji: "✅",
    items: [
      { name: "Kein Social Media vor 10 Uhr", attribute: "discipline", xp: 60, emoji: "📵" },
      { name: "Zimmer aufräumen", attribute: "discipline", xp: 40, emoji: "🧹" },
      { name: "Tagesplan erstellen", attribute: "discipline", xp: 30, emoji: "📅" },
      { name: "Pünktlich aufstehen", attribute: "discipline", xp: 50, emoji: "⏰" },
      { name: "5-Min Journal schreiben", attribute: "discipline", xp: 40, emoji: "📓" },
      { name: "Dankbarkeitsliste", attribute: "discipline", xp: 30, emoji: "🙏" },
    ],
  },
  hobbys: {
    label: "Hobbys",
    emoji: "🎨",
    items: [
      { name: "Gitarre üben", attribute: "intelligence", xp: 60, emoji: "🎸" },
      { name: "Zeichnen", attribute: "intelligence", xp: 50, emoji: "✏️" },
      { name: "Kochen / neues Rezept", attribute: "health", xp: 50, emoji: "🍳" },
      { name: "Programmieren lernen", attribute: "intelligence", xp: 80, emoji: "💻" },
      { name: "Fotografieren", attribute: "intelligence", xp: 40, emoji: "📷" },
    ],
  },
};

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributeType, setAttributeType] = useState<AttributeType>("discipline");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [color, setColor] = useState("#6366F1");
  const [durationMinutes, setDurationMinutes] = useState("0");

  function applySuggestion(s: Suggestion) {
    setName(s.name);
    setAttributeType(s.attribute);
    setShowSuggestions(false);
  }

  function resetForm() {
    setName(""); setDescription(""); setAttributeType("discipline");
    setFrequency("daily"); setColor("#6366F1"); setDurationMinutes("0");
    setShowSuggestions(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        await createHabit({
          name: name.trim(),
          description: description.trim() || null,
          attribute_type: attributeType,
          frequency,
          icon: "star",
          color,
          duration_minutes: parseInt(durationMinutes) || 0,
        });
        toast.success("Gewohnheit erstellt!");
        setOpen(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["habits"] });
      } catch {
        toast.error("Fehler beim Erstellen");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm px-4 py-2 transition-colors cursor-pointer"
        render={
          <button type="button">
            <Plus className="w-4 h-4" />
            Gewohnheit hinzufügen
          </button>
        }
      />
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Gewohnheit</DialogTitle>
        </DialogHeader>

        {/* Suggestions panel */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSuggestions((s) => !s)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground bg-secondary/60 hover:bg-secondary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Vorschläge
            </span>
            {showSuggestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showSuggestions && (
            <div className="p-3 space-y-3">
              {Object.entries(SUGGESTIONS).map(([key, cat]) => (
                <div key={key}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {cat.emoji} {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => applySuggestion(s)}
                        className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
                      >
                        {s.emoji} {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">Name *</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. 30 Minuten lesen"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-desc">Beschreibung</Label>
            <Textarea
              id="habit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Attribut</Label>
              <Select
                value={attributeType}
                onValueChange={(v) => setAttributeType(v as AttributeType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTE_OPTIONS.map(([type, meta]) => (
                    <SelectItem key={type} value={type}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Häufigkeit</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as HabitFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="duration">⏱ Dauer (Minuten)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="0 = kein Timer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="habit-color">Farbe</Label>
              <input
                id="habit-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-input cursor-pointer bg-transparent"
              />
            </div>
          </div>

          {/* XP preview — always server-calculated, shown read-only */}
          <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">⚡ XP Belohnung (automatisch)</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {xpForDuration(parseInt(durationMinutes) || 0)} XP
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground -mt-2">XP werden fair vom Server berechnet — basierend auf der Dauer. Kein manuelles Eintragen möglich.</p>

          <Button
            type="submit"
            disabled={isPending || !name.trim()}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            {isPending ? "Erstelle..." : "Gewohnheit erstellen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
