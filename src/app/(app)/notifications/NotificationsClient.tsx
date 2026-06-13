"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Send, Loader2, Megaphone, Mail, Users } from "lucide-react";
import { markAllNotificationsRead, markAllAnnouncementsRead, postAnnouncement } from "@/server/actions/notifications";
import { acceptFollowRequest, declineFollowRequest } from "@/server/actions/social";
import type { FeedItem } from "@/server/queries/notifications";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  contact_request: { icon: <Mail className="w-4 h-4" />,  color: "#6366f1", label: "Kontaktanfrage" },
  follow:          { icon: <Users className="w-4 h-4" />, color: "#EC4899", label: "Follower" },
  follow_request:  { icon: <Users className="w-4 h-4" />, color: "#8B5CF6", label: "Folgeanfrage" },
  system:          { icon: <Bell className="w-4 h-4" />,  color: "#F59E0B", label: "System" },
};

const EMOJIS = ["📢", "🎉", "🔥", "⚡", "🏆", "💪", "✨", "🎯", "🚀", "💡"];

function AnnouncementForm() {
  const [isPending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [emoji, setEmoji] = useState("📢");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    start(async () => {
      try {
        await postAnnouncement({ title, body, emoji });
        toast.success("Update gepostet!");
        setTitle(""); setBody(""); setEmoji("📢"); setOpen(false);
      } catch {
        toast.error("Fehler beim Posten");
      }
    });
  };

  return (
    <div className="app-card p-4 border-indigo-500/20 bg-indigo-500/5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer"
      >
        <Megaphone className="w-4 h-4" />
        Admin-Update posten
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mt-4 space-y-3 overflow-hidden"
          >
            {/* Emoji picker */}
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl rounded-lg p-1 transition-all cursor-pointer ${
                    emoji === e ? "bg-indigo-500/20 scale-110" : "hover:bg-secondary"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel des Updates…"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Beschreibung (optional)…"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Senden
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function FollowRequestActions({
  notificationId,
  requesterId,
}: {
  notificationId: string;
  requesterId: string;
}) {
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);
  const [isPending, start] = useTransition();

  if (done === "accepted") return <p className="text-xs text-green-500 mt-2 font-medium">✓ Angenommen</p>;
  if (done === "declined") return <p className="text-xs text-muted-foreground mt-2">Abgelehnt</p>;

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => start(async () => {
          try {
            await acceptFollowRequest(requesterId, notificationId);
            setDone("accepted");
            toast.success("Anfrage angenommen!");
          } catch (e) {
            toast.error("Fehler: " + (e instanceof Error ? e.message : "Unbekannt"));
          }
        })}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "✓ Annehmen"}
      </button>
      <button
        onClick={() => start(async () => {
          try {
            await declineFollowRequest(requesterId, notificationId);
            setDone("declined");
            toast.success("Anfrage abgelehnt");
          } catch (e) {
            toast.error("Fehler: " + (e instanceof Error ? e.message : "Unbekannt"));
          }
        })}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
      >
        Ablehnen
      </button>
    </div>
  );
}

function ContactRequestDetail({ metadata }: { metadata: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  if (!metadata?.name) return null;
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(o => !o)} className="text-[11px] text-indigo-500 hover:underline cursor-pointer">
        {open ? "Weniger anzeigen ▲" : "Details anzeigen ▼"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2 rounded-xl bg-secondary p-3 text-xs space-y-1"
          >
            <p><span className="text-muted-foreground">Name:</span> <strong>{String(metadata.name)}</strong></p>
            <p><span className="text-muted-foreground">E-Mail:</span> <a href={`mailto:${String(metadata.email)}`} className="text-indigo-500 underline">{String(metadata.email)}</a></p>
            <p><span className="text-muted-foreground">Anliegen:</span> {String(metadata.subject)}</p>
            {metadata.message != null && (
              <p className="pt-1 border-t border-border text-foreground leading-relaxed whitespace-pre-wrap">{String(metadata.message)}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NotificationsClient({
  feed,
  isAdmin,
}: {
  feed: FeedItem[];
  isAdmin: boolean;
}) {
  const [isPending, start] = useTransition();

  const handleMarkAll = () => {
    start(async () => {
      await Promise.all([markAllNotificationsRead(), markAllAnnouncementsRead()]);
      toast.success("Alle als gelesen markiert");
    });
  };

  const unreadCount = feed.filter((f) => !f.is_read).length;

  return (
    <div className="space-y-4">
      {/* Admin: post announcement */}
      {isAdmin && <AnnouncementForm />}

      {/* Header controls */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{unreadCount} ungelesen</p>
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
            Alle lesen
          </button>
        </div>
      )}

      {/* Feed */}
      {feed.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Keine Benachrichtigungen</p>
        </div>
      ) : (
        <div className="space-y-2">
          {feed.map((item, i) => {
            if (item.kind === "announcement") {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`app-card p-4 ${!item.is_read ? "border-indigo-500/30 bg-indigo-500/5" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 mt-0.5">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">GlowUp Update</span>
                        {!item.is_read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                      </div>
                      <p className="font-semibold text-sm text-foreground mt-0.5">{item.title}</p>
                      {item.body && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.body}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: de })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // Personal notification
            const meta = TYPE_META[item.type] ?? TYPE_META.system!;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`app-card p-4 ${!item.is_read ? "border-amber-400/30 bg-amber-400/5" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${meta.color}15`, color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      {!item.is_read && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                    </div>
                    <p className="font-semibold text-sm text-foreground mt-0.5">{item.title}</p>
                    {item.body && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.body}</p>}
                    {item.type === "contact_request" && (
                      <ContactRequestDetail metadata={item.metadata ?? {}} />
                    )}
                    {item.type === "follow_request" && item.metadata != null && item.metadata.requester_id != null && (
                      <FollowRequestActions
                        notificationId={item.id}
                        requesterId={String(item.metadata.requester_id)}
                      />
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-2">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
