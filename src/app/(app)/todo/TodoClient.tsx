"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Flag, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { createTodo, toggleTodo, deleteTodo } from "@/server/actions/todos";
import { useGameStore } from "@/stores/gameStore";
import { nanoid } from "nanoid";
import type { Todo } from "@/server/queries/todos";

const CATEGORIES = [
  { value: "schule", label: "Schule", emoji: "📚" },
  { value: "uni", label: "Uni", emoji: "🎓" },
  { value: "arbeit", label: "Arbeit", emoji: "💼" },
  { value: "sport", label: "Sport", emoji: "🏃" },
  { value: "einkauf", label: "Einkauf", emoji: "🛒" },
  { value: "privat", label: "Privat", emoji: "🏠" },
  { value: "general", label: "Sonstiges", emoji: "📝" },
];

const PRIORITY_META = {
  high: { label: "Hoch", color: "#EF4444", icon: "🔴" },
  normal: { label: "Normal", color: "#F59E0B", icon: "🟡" },
  low: { label: "Niedrig", color: "#10B981", icon: "🟢" },
};

function TodoItem({ todo }: { todo: Todo }) {
  const [isToggling, startToggle] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const { addXpPopup, showLevelUp } = useGameStore();

  const dueDate = todo.due_date ? new Date(todo.due_date + "T00:00:00") : null;
  const isOverdue = dueDate && !todo.is_completed && dueDate < new Date(new Date().toDateString());
  const cat = CATEGORIES.find((c) => c.value === todo.category) ?? CATEGORIES[CATEGORIES.length - 1]!;
  const pri = PRIORITY_META[todo.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: todo.is_completed ? 0.55 : 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card group"
    >
      <button
        onClick={() => startToggle(async () => {
          try {
            const completing = !todo.is_completed;
            const result = await toggleTodo(todo.id, completing);
            if (completing && result.xpEarned > 0) {
              addXpPopup({ id: nanoid(), amount: result.xpEarned });
              if (result.leveledUp) showLevelUp({ oldLevel: result.newLevel - 1, newLevel: result.newLevel, rank: result.newRank as import("@/lib/ranks").RankName });
              toast.success(`+${result.xpEarned} XP · +${result.coinsEarned} 🪙`, { description: "Todo abgeschlossen!" });
            }
          } catch { toast.error("Fehler"); }
        })}
        disabled={isToggling}
        className="shrink-0 cursor-pointer"
      >
        {todo.is_completed
          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          : <Circle className="w-5 h-5 text-muted-foreground hover:text-indigo-500 transition-colors" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{todo.emoji}</span>
          <span className={`text-sm font-medium ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {todo.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{cat.label}</span>
          {dueDate && (
            <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
              <Calendar className="w-2.5 h-2.5" />
              {dueDate.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
              {isOverdue && " · Überfällig!"}
            </span>
          )}
          <span className="text-[10px]" style={{ color: pri.color }}>{pri.icon} {pri.label}</span>
        </div>
      </div>

      <button
        onClick={() => startDelete(async () => { try { await deleteTodo(todo.id); } catch { toast.error("Fehler"); } })}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-all cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

function AddTodoForm({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      try {
        await createTodo({ title, emoji, category, priority, due_date: dueDate });
        toast.success("Todo erstellt!");
        onClose();
      } catch { toast.error("Fehler"); }
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="app-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-foreground">Neues Todo</p>
        <button type="button" onClick={onClose} className="p-1 rounded cursor-pointer hover:bg-secondary">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex gap-2">
        <select
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="w-14 text-center text-lg rounded-lg border border-border bg-background focus:outline-none"
        >
          {["📝","📚","🎓","💼","🏃","🛒","🏠","💪","🧹","📐","✍️","🎯","⚡","🎸","💊"].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Was musst du erledigen?"
          required
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
        >
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-2 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
        >
          <option value="high">🔴 Hoch</option>
          <option value="normal">🟡 Normal</option>
          <option value="low">🟢 Niedrig</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-2 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
      >
        {isPending ? "Speichere…" : "Hinzufügen"}
      </button>
    </motion.form>
  );
}

export function TodoClient({ todos }: { todos: Todo[] }) {
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  const filtered = todos.filter((t) => {
    if (filter === "open") return !t.is_completed;
    if (filter === "done") return t.is_completed;
    return true;
  });

  const open = todos.filter((t) => !t.is_completed).length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-xl bg-secondary">
          {(["all", "open", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Alle" : f === "open" ? `Offen (${open})` : "Erledigt"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Todo
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && <AddTodoForm key="add-form" onClose={() => setAdding(false)} />}
      </AnimatePresence>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm text-muted-foreground">
            {filter === "done" ? "Noch nichts erledigt" : "Keine offenen Todos"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
