"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Clock,
  FolderKanban,
  Star,
  ShieldCheck,
  Users,
  Lock,
  Search,
  Sparkles,
  Bot,
  Activity,
  UserPlus,
  CheckCircle,
  MessageSquare,
  KanbanSquare,
  Library,
  Wallet,
  GitMerge,
  Target,
} from "lucide-react";
import { SiDiscord, SiGithub } from "react-icons/si";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

export default function Home() {
  // --- Framer Motion 3D Parallax Logic ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  // ---------------------------------------

  return (
    <main className="bg-[#0d0d12] min-h-screen text-white flex flex-col font-sans selection:bg-purple-500/30">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight text-zinc-100">
                Find the right teammates for your next big idea.
              </h1>
              <div className="space-y-1">
                <p className="text-zinc-100 text-lg md:text-xl font-medium">
                  Hackathons. Startups. Research. Open Source.
                </p>
                <p className="text-[#f97316] text-lg md:text-xl font-medium">
                  Are you prepared to build the future?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/projects">
                <Button
                  variant="outline"
                  className="border-white/20 bg-transparent hover:bg-white/5 rounded-lg px-8 py-6 text-base font-semibold transition-all"
                >
                  <AnimatedShinyText>Explore Projects</AnimatedShinyText>
                </Button>
              </Link>
              <Link href="/api/auth/signin">
                <Button className="bg-[#d8b4fe] hover:bg-[#c084fc] text-black rounded-lg px-8 py-6 text-base font-semibold transition-all">
                  Get Started <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Pure Framer Motion 3D Card */}
          <div className="relative group perspective-[1000px] flex justify-center lg:justify-end">
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full lg:w-[500px] rounded-2xl cursor-pointer"
            >
              <div
                style={{ transformStyle: "preserve-3d" }}
                className="bg-[#1a1a24]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-6"
              >
                <div
                  style={{ transform: "translateZ(40px)" }}
                  className="flex justify-between items-start w-full"
                >
                  <h3 className="text-xl font-semibold text-zinc-100">
                    Build a Scalable Chat App
                  </h3>
                  <div className="flex gap-2 text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10">
                      <Clock className="size-3" /> 14 Days
                    </span>
                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10">
                      3 / 5 Team
                    </span>
                  </div>
                </div>

                <div
                  style={{ transform: "translateZ(50px)" }}
                  className="flex flex-wrap gap-2 text-xs"
                >
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-md">
                    React
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md">
                    Node.js
                  </span>
                  <span className="bg-white/5 text-zinc-300 border border-white/10 px-2 py-1 rounded-md">
                    System Design
                  </span>
                </div>

                <div
                  style={{ transform: "translateZ(30px)" }}
                  className="space-y-4 text-sm text-zinc-300 leading-relaxed"
                >
                  <p>
                    We are building an open-source alternative to Discord. The
                    project revolves around a real-time WebSocket architecture
                    capable of handling thousands of concurrent connections.
                  </p>
                  <p>
                    Implement a <strong>real-time message broker</strong> from
                    scratch.
                  </p>
                </div>

                <div
                  style={{ transform: "translateZ(80px)" }}
                  className="w-full mt-4"
                >
                  <div className="w-full h-48 bg-linear-to-br from-purple-900/40 to-blue-900/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden relative shadow-2xl">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center border-t border-white/5">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-zinc-100">
          What is Project Matchmaker?
        </h2>
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
          A platform built to help students find teammates for hackathons,
          college projects, startup ideas, research work, and open-source
          contributions. Create profiles, publish ideas, recruit members, and
          build a reputation based on actual shipped code.
        </p>
      </section>

      {/* ================= 3-LAYER FEATURES SECTION ================= */}
      <section className="relative z-10 bg-[#12121a] py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-semibold text-zinc-100 tracking-tight mb-6">
              A complete ecosystem for builders.
            </h2>
            <p className="text-zinc-400 text-lg">
              From finding your perfect co-founder to shipping the final
              product, we provide every tool you need along the way.
            </p>
          </div>

          {/* LAYER 1: Discovery & Matching */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-2">
                <Search className="size-6 text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-zinc-100">
                Discovery & Matching
              </h3>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Connect your GitHub and let our engine do the heavy lifting.
                Find teammates based on proven skills, real contributions, and
                verifiable reputations.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3 text-zinc-300">
                  <SiGithub className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">GitHub Ingestion:</strong>{" "}
                    Secure OAuth that automatically pulls your repos, bio, and
                    live contribution heatmaps.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <Bot className="size-5 text-[#d8b4fe] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">AI Recommendations:</strong>{" "}
                    Smart algorithms that suggest teammates based on required
                    project skills and past experience.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <Star className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Trust Scores:</strong> Build
                    undeniable reputation with post-project peer reviews on
                    teamwork and technical ability.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <Activity className="size-5 text-[#f97316] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Live Availability:</strong>{" "}
                    Toggle your status to "Looking for Team" so recruiters can
                    find you instantly.
                  </span>
                </li>
              </ul>
            </div>

            {/* Layer 1 Visual Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <SiGithub className="size-8 text-zinc-400" />
                <span className="font-medium text-sm">OAuth Profile</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <Activity className="size-8 text-emerald-400" />
                <span className="font-medium text-sm">Contribution Graph</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <ShieldCheck className="size-8 text-blue-400" />
                <span className="font-medium text-sm">
                  Verified Trust Score
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <Sparkles className="size-8 text-[#d8b4fe]" />
                <span className="font-medium text-sm">AI Skill Matching</span>
              </div>
            </div>
          </div>

          {/* LAYER 2: Project Marketplace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Layer 2 Visual Grid */}
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <FolderKanban className="size-8 text-[#f97316]" />
                <span className="font-medium text-sm">Project Lifecycle</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <UserPlus className="size-8 text-zinc-400" />
                <span className="font-medium text-sm">Direct Invites</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <Target className="size-8 text-red-400" />
                <span className="font-medium text-sm">Role-Specific Slots</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <CheckCircle className="size-8 text-emerald-400" />
                <span className="font-medium text-sm">Applicant Review</span>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center justify-center p-3 bg-[#f97316]/10 rounded-xl border border-[#f97316]/20 mb-2">
                <FolderKanban className="size-6 text-[#f97316]" />
              </div>
              <h3 className="text-3xl font-bold text-zinc-100">
                Project Marketplace
              </h3>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Pitch your idea and build your dream team. Control exactly who
                joins your project with granular role-based slots and
                application reviews.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3 text-zinc-300">
                  <CheckCircle className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Role-Based Apps:</strong>{" "}
                    Post specific slots (e.g., 1x Frontend, 1x DevOps) to ensure
                    a perfectly balanced team.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <FolderKanban className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Full Lifecycle:</strong> Move
                    projects seamlessly from "Recruiting", to "Active", and
                    finally "Completed".
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <UserPlus className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">
                      Headhunting & Invites:
                    </strong>{" "}
                    Browse the talent pool and send direct invites to developers
                    whose skills match your stack.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <Target className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Algorithmic Feed:</strong>{" "}
                    Find projects specifically tailored to your tech stack via
                    the personalized explore page.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* LAYER 3: Collaboration Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center p-3 bg-[#d8b4fe]/10 rounded-xl border border-[#d8b4fe]/20 mb-2">
                <Users className="size-6 text-[#d8b4fe]" />
              </div>
              <h3 className="text-3xl font-bold text-zinc-100">
                Team Hub Collaboration
              </h3>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Once the team is assembled, shift into execution mode. Every
                project gets a dedicated, secure workspace to manage tasks,
                funds, and communication.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3 text-zinc-300">
                  <MessageSquare className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Unified Comms:</strong>{" "}
                    Real-time group chats for the whole project, plus private
                    1-on-1 messaging.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <KanbanSquare className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Interactive Kanban:</strong>{" "}
                    Drag-and-drop task boards perfectly synced across your team
                    in real-time.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <Wallet className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Expense Tracker:</strong>{" "}
                    Visually track hosting costs, API keys, and domain purchases
                    with dynamic charts.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-zinc-300">
                  <GitMerge className="size-5 text-zinc-100 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Vault & Webhooks:</strong>{" "}
                    Store vital Figma/Repo links in the Resource Vault and track
                    milestones effortlessly.
                  </span>
                </li>
              </ul>
            </div>

            {/* Layer 3 Visual Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <MessageSquare className="size-8 text-blue-400" />
                <span className="font-medium text-sm">Live Group Chat</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <KanbanSquare className="size-8 text-[#d8b4fe]" />
                <span className="font-medium text-sm">Kanban Board</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <Library className="size-8 text-zinc-400" />
                <span className="font-medium text-sm">Resource Vault</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                <Wallet className="size-8 text-emerald-400" />
                <span className="font-medium text-sm">Expense Tracker</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECURITY & ROLES SECTION ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="size-12 text-zinc-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-zinc-100">
            Secure & Role-Based
          </h2>
          <p className="text-zinc-400 mt-4 text-lg">
            Strict authorization rules keep your team workspaces private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="flex items-start gap-4 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
            <Users className="size-6 text-zinc-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-zinc-200 mb-1">
                Visitors (Not Logged In)
              </h4>
              <p className="text-sm text-zinc-500">
                Can browse public projects and view user profiles. Cannot create
                projects, apply to teams, or view private Team Hubs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
            <Lock className="size-6 text-blue-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-zinc-200 mb-1">
                Members (Logged In)
              </h4>
              <p className="text-sm text-zinc-500">
                Can apply to projects, accept invites, and access their own Team
                Hubs to chat. Cannot edit projects they do not own.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
            <ShieldCheck className="size-6 text-[#d8b4fe] shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-zinc-200 mb-1">Project Owners</h4>
              <p className="text-sm text-zinc-500">
                Full control over their projects. Can edit details,
                accept/reject applicants, manage the team, and update project
                status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER CTA ================= */}
      <footer className="py-12 border-t border-white/10 text-center">
        <p className="text-zinc-500 text-sm mb-4">Ready to start building?</p>
        <Link href="/api/auth/signin">
          <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6">
            Join the Community
          </Button>
        </Link>
      </footer>
    </main>
  );
}
