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

const ATTRIBUTE_OPTIONS = Object.entries(ATTRIBUTE_META) as [
  AttributeType,
  (typeof ATTRIBUTE_META)[AttributeType],
][];

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributeType, setAttributeType] = useState<AttributeType>("discipline");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [xpReward, setXpReward] = useState("50");
  const [color, setColor] = useState("#6366F1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        await createHabit({
          name: name.trim(),
          description: description.trim() || null,
          attribute_type: attributeType,
          xp_reward: parseInt(xpReward) || 50,
          coin_reward: Math.floor((parseInt(xpReward) || 50) / 5),
          frequency,
          icon: "star",
          color,
        });
        toast.success("Gewohnheit erstellt!");
        setOpen(false);
        setName("");
        setDescription("");
        queryClient.invalidateQueries({ queryKey: ["habits"] });
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
            Gewohnheit hinzufügen
          </button>
        }
      />
      <DialogContent className="glass border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Gewohnheit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
              <Label htmlFor="xp-reward">XP-Belohnung</Label>
              <Input
                id="xp-reward"
                type="number"
                min="10"
                max="500"
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
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
