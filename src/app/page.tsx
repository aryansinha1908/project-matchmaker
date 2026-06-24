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
                  <div className="w-full h-48 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden relative shadow-2xl">
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

      {/* ================= FEATURES SECTION (MVP) ================= */}
      <section className="relative z-10 bg-[#12121a] py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-zinc-100">
              Everything you need to ship.
            </h2>
            <p className="text-zinc-400 mt-4 text-lg">
              Powerful features designed for developer collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="bg-[#d8b4fe]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <SiGithub className="text-[#d8b4fe] size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">GitHub Integration</h3>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li>
                  <strong className="text-zinc-200">Only GitHub:</strong> Secure
                  login exclusively via GitHub accounts.
                </li>
                <li>
                  <strong className="text-zinc-200">Show Your Work:</strong>{" "}
                  Auto-syncs your username, bio, and public repos.
                </li>
                <li>
                  <strong className="text-zinc-200">Contribution Graph:</strong>{" "}
                  Live GitHub heatmaps on every profile to prove activity.
                </li>
                <li>
                  <strong className="text-zinc-200">Status Updates:</strong>{" "}
                  Toggle between Available, Busy, or Looking for Team.
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="bg-[#f97316]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <FolderKanban className="text-[#f97316] size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Project Management</h3>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li>
                  <strong className="text-zinc-200">Pitch Ideas:</strong> Define
                  required skills, roles, and max team sizes.
                </li>
                <li>
                  <strong className="text-zinc-200">Lifecycle:</strong> Move
                  projects from Recruiting to Active to Completed.
                </li>
                <li>
                  <strong className="text-zinc-200">Apply & Review:</strong>{" "}
                  Dedicated owner dashboards to accept or reject applicants.
                </li>
                <li>
                  <strong className="text-zinc-200">Team Invites:</strong>{" "}
                  Headhunt developers and send direct team invitations.
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="bg-emerald-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Star className="text-emerald-400 size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ratings & Trust</h3>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li>
                  <strong className="text-zinc-200">Peer Reviews:</strong> Leave
                  feedback when a project is marked Completed.
                </li>
                <li>
                  <strong className="text-zinc-200">Detailed Metrics:</strong>{" "}
                  Rate on Communication, Technical Skills, and Teamwork.
                </li>
                <li>
                  <strong className="text-zinc-200">Trust Score:</strong> Build
                  an undeniable reputation score displayed publicly on your
                  profile based on past successful projects.
                </li>
              </ul>
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
