"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle glass effect after scrolling down 10px
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full h-16 sticky top-0 z-50 flex items-center px-6 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0d0d12]/50 backdrop-blur-lg border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Left Side: Logo & Navigation Links */}
      <div className="flex items-center gap-10 flex-1">
        <Link
          href="/"
          className="font-bold text-xl text-zinc-100 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Sparkles className="size-5 text-[#d8b4fe]" />
          <span>Project Matchmaker</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-md font-medium text-zinc-400">
          <Link
            href="/projects"
            className="hover:text-zinc-100 transition-colors"
          >
            Discover
          </Link>

          {/* Only show private routes if the user is logged in */}
          {session?.user && (
            <>
              <Link
                href="/my-projects"
                className="hover:text-zinc-100 transition-colors"
              >
                My Projects
              </Link>
              <Link
                href="/chats"
                className="hover:text-zinc-100 transition-colors"
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
          <Link href="/dashboard" className="block relative group">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Profile"}
                className="size-12 rounded-full border-2 border-zinc-800 group-hover:border-[#d8b4fe] group-hover:scale-105 transition-all object-cover"
              />
            ) : (
              <div className="size-9 rounded-full bg-white/5 border-2 border-zinc-800 group-hover:border-[#d8b4fe] group-hover:scale-105 flex items-center justify-center text-sm font-medium text-zinc-300 transition-all">
                {session.user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </Link>
        ) : (
          <Button
            onClick={() => (window.location.href = "/api/auth/signin")}
            className="bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
          >
            Get Started
          </Button>
        )}
      </div>
    </header>
  );
}
