"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { followUser, unfollowUser } from "@/server/actions/social";
import { toast } from "sonner";

export function FollowButtonPublic({
  targetId,
  initialFollowing,
  username,
}: {
  targetId: string;
  initialFollowing: boolean;
  username: string;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, start] = useTransition();

  const handle = () => {
    start(async () => {
      try {
        if (following) {
          await unfollowUser(targetId);
          toast.success(`${username} entfolgt`);
        } else {
          await followUser(targetId);
          toast.success(`${username} gefolgt!`);
        }
        setFollowing((f) => !f);
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
        following
          ? "bg-secondary text-foreground hover:bg-red-500/10 hover:text-red-500"
          : "bg-indigo-500 hover:bg-indigo-600 text-white"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : following ? (
        <><UserCheck className="w-4 h-4" /> Gefolgt</>
      ) : (
        <><UserPlus className="w-4 h-4" /> Folgen</>
      )}
    </button>
  );
}
