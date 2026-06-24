"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, ShieldCheck } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { IUser } from "@/models/user"; // Adjust this import path based on your project structure

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  looking_for_team: "Looking for Team",
  looking_for_projects: "Looking for Projects",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/20 text-green-400 border-green-500/30",
  busy: "bg-red-500/20 text-red-400 border-red-500/30",
  looking_for_team: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  looking_for_projects: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUserProfile() {
      if (!username) return;

      try {
        const res = await fetch(`/api/users?githubUsername=${username}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "User not found");
        }

        // Handle case where API might wrap the user in a `user` key or return it directly
        const userData = json.user || json;
        setUser(userData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [username]);

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </PageContainer>
    );
  }

  if (error || !user) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-2">
          <p className="text-destructive text-lg font-semibold">
            {error || "User not found"}
          </p>
          <p className="text-muted-foreground">
            The user @{username} doesn't exist or hasn't created a profile.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      {/* Top section: profile left, about right */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Left: Profile Information */}
        <div className="flex flex-col items-center gap-4 pt-4 border-r border-border/50 pr-4">
          {/* Avatar & Status */}
          <div className="relative">
            <Avatar className="size-36 border-2 border-border">
              <AvatarImage src={user.avatar} alt={user.githubUsername} />
              <AvatarFallback className="text-3xl">
                {user.githubUsername?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            {user.status && (
              <span
                className={`absolute bottom-1 right-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[user.status] ?? ""}`}
              >
                {STATUS_LABELS[user.status] ?? user.status}
              </span>
            )}
          </div>

          {/* User Details & Trust Score */}
          <div className="text-center w-full space-y-2">
            {user.name && (
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">
                {user.name}
              </h2>
            )}
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 font-medium text-muted-foreground hover:text-[#d8b4fe] transition-colors"
            >
              <SiGithub className="size-4" />@{user.githubUsername}
            </a>

            {/* Trust Score Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium">
              <ShieldCheck className="size-4" />
              Trust Score: {user.trustScore ?? 0}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="w-full text-center mt-2">
              <p className="text-sm text-muted-foreground italic">
                "{user.bio}"
              </p>
            </div>
          )}

          {/* Skills Section */}
          <div className="w-full mt-4 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground border-b border-border/50 pb-2">
              Technical Skills
            </h3>
            {user.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-white/5 hover:bg-white/10 font-normal"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No skills listed.
              </p>
            )}
          </div>
        </div>

        {/* Right: About Me */}
        <div className="space-y-6">
          <Card className="h-full border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                About Me
              </CardTitle>
            </CardHeader>

            <CardContent>
              {user.profileReadme ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {user.profileReadme}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground space-y-2">
                  <SiGithub className="size-8 opacity-20" />
                  <p className="italic text-sm">
                    This user hasn't synced their GitHub README yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contribution Heatmap */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Contribution Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://ghchart.rshah.org/${user.githubUsername}`}
            alt={`${user.githubUsername}'s GitHub contribution chart`}
            className="min-w-[700px] w-full"
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
