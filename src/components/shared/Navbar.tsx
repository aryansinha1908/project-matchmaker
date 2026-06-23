"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="w-full h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <Link href="/" className="font-bold text-xl text-primary">
        Project MatchMaker
      </Link>

      {session?.user ? (
        <Link href="/dashboard">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Profile"}
              className="size-9 rounded-full ring-2 ring-border hover:ring-primary transition-all"
            />
          ) : (
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium ring-2 ring-border hover:ring-primary transition-all">
              {session.user.name?.[0] ?? "?"}
            </div>
          )}
        </Link>
      ) : (
        <Button onClick={() => (window.location.href = "/login")}>
          Get Started
        </Button>
      )}
    </header>
  );
}
