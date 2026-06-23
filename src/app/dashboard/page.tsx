"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardResponse } from "@/types/dashboardResponse";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface Project {
  _id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
}

type Activity = {
  id: string;
  type: "project" | "github";
  message: string;
  createdAt: string;
};

function parseGithubEvent(event: any) {
  switch (event.type) {
    case "PushEvent":
      return `Pushed commits to ${event.repo}`;
    case "PullRequestEvent":
      return `Opened PR in ${event.repo}`;
    case "WatchEvent":
      return `Starred ${event.repo}`;
    case "CreateEvent":
      return `Created ${event.repo}`;
    default:
      return `Activity in ${event.repo}`;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();

        console.log("Dashboard response:", json);

        if (!res.ok) {
          throw new Error(json.message || "Failed to load dashboard");
        }

        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-destructive">{error || "Something went wrong"}</p>
      </PageContainer>
    );
  }

  const { profile, projects } = data;

  const recentProjects = [...projects.active, ...projects.completed].slice(
    0,
    5,
  );

  const githubEvents = data.githubEvents || [];

  const projectActivities: Activity[] = recentProjects.map((p) => ({
    id: p._id,
    type: "project",
    message: `Joined project ${p.title}`,
    createdAt: p.createdAt,
  }));

  const githubActivities: Activity[] = githubEvents.map(
    (event: any, idx: number) => ({
      id: `gh-${idx}`,
      type: "github",
      message: parseGithubEvent(event),
      createdAt: event.createdAt,
    }),
  );

  const activities = [...projectActivities, ...githubActivities]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);

  return (
    <PageContainer className="space-y-6">
      {/* Top section: profile left, about + recent projects right */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Left: Profile */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="relative">
            <Avatar className="size-36 border-2 border-border">
              <AvatarImage src={profile.avatar} alt={profile.username} />
              <AvatarFallback className="text-3xl">
                {profile.username?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            {profile.status && (
              <span
                className={`absolute bottom-1 right-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[profile.status] ?? ""}`}
              >
                {STATUS_LABELS[profile.status] ?? profile.status}
              </span>
            )}
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">@{profile.username}</p>
            <p className="text-sm text-muted-foreground">
              {STATUS_LABELS[profile.status]}
            </p>
          </div>
        </div>

        {/* Right: About + Recent Projects stacked */}
        <div className="space-y-6">
          {/* About Me */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                About Me
              </CardTitle>
            </CardHeader>

            <CardContent>
              {profile.profileReadme ? (
                <div className="prose prose-sm dark:prose-invert max-w-none max-h-72 overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {profile.profileReadme}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No profile README found.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Recent Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No projects yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {recentProjects.map((p) => (
                    <li
                      key={p._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{p.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {p.category}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {p.status}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contribution Heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Contribution Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://ghchart.rshah.org/${profile.username}`}
            alt={`${profile.username}'s GitHub contribution chart`}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Recent Activity
          </CardTitle>
        </CardHeader>

        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No recent activity.
            </p>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 rounded-full shrink-0",
                      activity.type === "github"
                        ? "bg-blue-500"
                        : "bg-green-500",
                    )}
                  />

                  <div>
                    <p>{activity.message}</p>

                    <p className="text-xs text-muted-foreground/70">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
