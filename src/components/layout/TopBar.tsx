"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
  user: User | null;
}

export function TopBar({ title, user }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 border-b border-white/5 bg-background/80 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden w-8 h-8">
          <Menu className="w-4 h-4" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
            <span className="text-sm">💰</span>
            <span className="text-xs font-semibold text-amber-400">
              {user.coins.toLocaleString()}
            </span>
          </div>
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="cursor-pointer rounded-full focus:outline-none"
              render={
                <button type="button" aria-label="Nutzer-Menü">
                  <Avatar className="w-8 h-8 ring-1 ring-indigo-500/30">
                    <AvatarImage src={user.avatar_url ?? ""} />
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
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
      </div>
    </header>
  );
}
