"use client";

import type { User } from "@/types";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  title: string;
  user: User | null;
}

export function TopBar({ title, user }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-13 px-5 lg:px-7 border-b border-border bg-background/90 backdrop-blur-xl">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="cursor-pointer focus:outline-none"
            render={
              <button type="button" aria-label="Nutzer-Menü">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-indigo-400">
                      {user.username.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive focus:text-destructive"
            >
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
