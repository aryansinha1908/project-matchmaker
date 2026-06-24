"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="w-full h-16 border-b border-border bg-background flex items-center px-6">
      {/* Left Side: Logo & Navigation Links */}
      <div className="flex items-center gap-10 flex-1">
        <Link href="/" className="font-bold text-xl text-primary">
          Project MatchMaker
        </Link>

        {/* Desktop Navigation - Changed from text-sm to text-base */}
        <nav className="hidden md:flex items-center gap-8 text-base font-medium text-muted-foreground">
          <Link
            href="/projects"
            className="hover:text-foreground transition-colors"
          >
            Discover
          </Link>

          {/* Only show private routes if the user is logged in */}
          {session?.user && (
            <>
              <Link
                href="/my-projects"
                className="hover:text-foreground transition-colors"
              >
                My projects
              </Link>
              <Link
                href="/chats"
                className="hover:text-foreground transition-colors"
              >
                Chats
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Right Side: Profile Icon or Login Button */}
      <div className="shrink-0">
        {session?.user ? (
          <Link href="/dashboard">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Profile"}
                className="size-9 rounded-full ring-2 ring-border hover:ring-primary transition-all object-cover"
              />
            ) : (
              <div className="size-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium ring-2 ring-border hover:ring-primary transition-all">
                {session.user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </Link>
        ) : (
          <Button onClick={() => (window.location.href = "/api/auth/signin")}>
            Get Started
          </Button>
        )}
      </div>
    </header>
  );
}
