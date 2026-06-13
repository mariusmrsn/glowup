"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserCheck, Clock, Loader2 } from "lucide-react";
import { sendFollowRequest, cancelFollowRequest, unfollowUser } from "@/server/actions/social";
import { toast } from "sonner";

type FollowState = "none" | "pending" | "following";

export function FollowButtonPublic({
  targetId,
  initialState,
  username,
}: {
  targetId: string;
  initialState: FollowState;
  username: string;
}) {
  const [state, setState] = useState<FollowState>(initialState);
  const [isPending, start] = useTransition();

  const handle = () => {
    start(async () => {
      try {
        if (state === "following") {
          await unfollowUser(targetId);
          setState("none");
          toast.success(`${username} entfolgt`);
        } else if (state === "pending") {
          await cancelFollowRequest(targetId);
          setState("none");
          toast.success("Anfrage zurückgezogen");
        } else {
          await sendFollowRequest(targetId);
          setState("pending");
          toast.success(`Anfrage an ${username} gesendet`);
        }
      } catch {
        toast.error("Fehler");
      }
    });
  };

  return (
    <button
      onClick={handle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 ${
        state === "following"
          ? "bg-secondary text-foreground hover:bg-red-500/10 hover:text-red-500"
          : state === "pending"
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-red-500/10 hover:text-red-500"
          : "bg-indigo-500 hover:bg-indigo-600 text-white"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : state === "following" ? (
        <><UserCheck className="w-4 h-4" /> Gefolgt</>
      ) : state === "pending" ? (
        <><Clock className="w-4 h-4" /> Ausstehend</>
      ) : (
        <><UserPlus className="w-4 h-4" /> Folgen</>
      )}
    </button>
  );
}
