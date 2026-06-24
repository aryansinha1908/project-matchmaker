"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  ArrowLeft,
  Users,
  Calendar,
  Briefcase,
  Code,
  Settings,
  Sparkles,
  Check,
  Send,
  Info,
  UserMinus,
  Crown,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

interface ProjectDetails {
  _id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  requiredRoles: string[];
  maxTeamSize: number;
  status: "recruiting" | "active" | "completed" | "archived";
  createdAt: string;
  owner: {
    _id: string;
    githubUsername?: string;
    email: string;
    avatar?: string;
  };
}

interface ProjectData {
  project: ProjectDetails;
  userRole: string | null;
  isOwner: boolean;
}

interface TeamMember {
  _id: string;
  role: string;
  createdAt: string;
  user: {
    _id: string;
    githubUsername: string;
    email: string;
    avatar: string;
  };
}

type Recommendation = {
  userId: string;
  githubUsername: string;
  avatar: string;
  score: number;
  reason: string;
};

const STATUS_COLORS: Record<string, string> = {
  recruiting:
    "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]",
  active:
    "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
  completed:
    "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

function getSimilarityColor(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-red-500";
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState(false);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [inviteStatus, setInviteStatus] = useState<
    Record<string, "idle" | "loading" | "success" | "error">
  >({});

  useEffect(() => {
    async function loadPageData() {
      try {
        const [projectRes, membersRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/memberships?projectId=${projectId}`),
        ]);

        const projectJson = await projectRes.json();

        if (!projectRes.ok) {
          throw new Error(projectJson.message || "Failed to load project");
        }
        setData(projectJson);

        if (membersRes.ok) {
          const membersJson = await membersRes.json();
          setTeamMembers(membersJson.memberships || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadPageData();
    } else {
      // FIX: If there is no projectId in the URL, stop loading and show an error!
      setError("Invalid Project ID or Route");
      setLoading(false);
    }
  }, [projectId]);

  // FIX: Implement remove member — was a placeholder with no handler
  async function handleRemoveMember(membershipId: string) {
    if (!confirm("Remove this member from the project?")) return;
    setRemovingId(membershipId);
    try {
      const res = await fetch(`/api/memberships/${membershipId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // FIX: Safe JSON parse — response may be empty or HTML (e.g. a 405),
        // calling .json() unconditionally causes "unexpected end of data"
        let message = `Failed to remove member (${res.status})`;
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          try {
            const json = await res.json();
            message = json.message ?? message;
          } catch {
            // body was malformed — keep fallback message
          }
        }
        throw new Error(message);
      }

      setTeamMembers((prev) => prev.filter((m) => m._id !== membershipId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  async function fetchRecommendations() {
    try {
      setAiLoading(true);
      setAiError("");

      const res = await fetch(`/api/projects/${projectId}/recommendations`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "AI recommendation failed");

      setRecommendations(json.recommendations);

      const initialStatus: Record<string, "idle"> = {};
      json.recommendations.forEach((rec: Recommendation) => {
        initialStatus[rec.userId] = "idle";
      });
      setInviteStatus(initialStatus);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleInvite(candidateId: string) {
    setInviteStatus((prev) => ({ ...prev, [candidateId]: "loading" }));
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          invitedUserId: candidateId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to send invite");

      setInviteStatus((prev) => ({ ...prev, [candidateId]: "success" }));
    } catch (err: any) {
      console.error(err);
      setInviteStatus((prev) => ({ ...prev, [candidateId]: "error" }));
      alert(err.message);
    }
  }

  async function handleStartChat(targetUserId: string) {
    setStartingChat(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) throw new Error("Failed to start chat");

      // Redirect the user straight to their inbox!
      router.push("/chats");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setStartingChat(false);
    }
  }

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
        <p className="text-destructive text-lg font-medium">
          {error || "Project not found"}
        </p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-white/10 hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 size-4" /> Go Back
        </Button>
      </PageContainer>
    );
  }

  const { project, userRole, isOwner } = data;

  return (
    <PageContainer className="py-10 relative space-y-8">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Top Navigation & Header */}
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-100 flex items-center gap-2 transition-colors w-fit group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </button>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="outline"
              className="text-xs bg-white/5 border-white/10 text-zinc-300 px-2.5 py-1"
            >
              {project.category}
            </Badge>
            <Badge
              variant="outline"
              className={`capitalize text-xs px-2.5 py-1 ${STATUS_COLORS[project.status] || ""}`}
            >
              {project.status}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= LEFT COLUMN: MAIN CONTENT ================= */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/5 bg-black/20 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-3 border-b border-white/5 px-6 pt-6">
              <CardTitle className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                <Info className="size-5 text-zinc-400" /> About the Project
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-zinc-400 leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/5 bg-black/20 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 border-b border-white/5 px-6 pt-6">
                <CardTitle className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                  <Code className="size-4 text-emerald-400" /> Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {project.requiredSkills && project.requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">
                    No specific skills listed.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-black/20 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 border-b border-white/5 px-6 pt-6">
                <CardTitle className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                  <Briefcase className="size-4 text-blue-400" /> Required Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {project.requiredRoles && project.requiredRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.requiredRoles.map((role, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-blue-500/5 text-blue-300 border-blue-500/20"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">
                    No specific roles listed.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ================= TEAM MANAGEMENT SECTION ================= */}
          <div className="pt-6 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <Users className="size-6 text-zinc-400" /> Team Management
            </h2>

            {/* Current Members List */}
            <Card className="border-white/5 bg-black/20 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 border-b border-white/5 px-6 pt-6 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-zinc-200">
                  Current Members
                </CardTitle>
                <Badge variant="outline" className="bg-white/5 border-white/10">
                  {teamMembers.length} / {project.maxTeamSize} Joined
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {teamMembers.length === 0 ? (
                  <div className="p-6 text-center text-sm text-zinc-500">
                    No members have joined yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {teamMembers.map((member) => (
                      <li
                        key={member._id}
                        className="p-4 sm:px-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="size-10 border border-white/10">
                              <AvatarImage
                                src={member.user?.avatar}
                                alt={member.user?.githubUsername}
                              />
                              <AvatarFallback className="bg-zinc-800 text-zinc-300">
                                {member.user?.githubUsername?.[0]?.toUpperCase() ||
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                            {project.owner._id === member.user?._id && (
                              <Crown className="absolute -top-1.5 -right-1.5 size-3.5 text-amber-400 fill-amber-400/60" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/${member.user?.githubUsername}`}
                                className="font-semibold text-sm text-zinc-200 hover:text-[#d8b4fe] transition-colors flex items-center gap-1"
                              >
                                @{member.user?.githubUsername || "Unknown"}
                              </Link>
                            </div>
                            <p className="text-xs text-zinc-500 capitalize mt-0.5">
                              Role: {member.role}
                            </p>
                          </div>
                        </div>

                        {isOwner && project.owner._id !== member.user?._id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member._id)}
                            disabled={removingId === member._id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            {removingId === member._id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <UserMinus className="size-4" />
                            )}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* AI Recommendations Card */}
            <Card className="border-purple-500/30 bg-gradient-to-br from-[#1a1325] to-[#0d0d12] shadow-[0_0_40px_rgba(168,85,247,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

              <CardHeader className="pb-4 border-b border-purple-500/20 px-6 pt-6 relative z-10">
                <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="size-5 text-[#d8b4fe]" /> AI Matchmaker &
                  Invites
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 relative z-10">
                {recommendations.length === 0 && !aiLoading && !aiError ? (
                  <div className="flex flex-col items-center text-center space-y-5 py-6">
                    <div className="size-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner">
                      <Sparkles className="size-8 text-purple-400" />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-zinc-200 font-medium text-lg">
                        Find Your Perfect Teammates
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Let AI analyze developer skills, availability, and
                        GitHub activity to find the best matches for this
                        project.
                      </p>
                    </div>

                    <Button
                      onClick={fetchRecommendations}
                      disabled={!isOwner}
                      className="bg-gradient-to-r from-[#c084fc] to-[#d8b4fe] hover:from-[#a855f7] hover:to-[#c084fc] text-black font-semibold shadow-lg shadow-purple-500/20 px-8"
                    >
                      <Sparkles className="size-4 mr-2" /> Generate Matches
                    </Button>

                    {!isOwner && (
                      <p className="text-xs text-zinc-500 font-medium">
                        Only the project owner can generate recommendations.
                      </p>
                    )}
                  </div>
                ) : aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping" />
                      <Loader2 className="size-10 animate-spin text-[#d8b4fe] relative z-10" />
                    </div>
                    <p className="text-sm font-medium text-purple-300/80 animate-pulse">
                      Analyzing developer profiles...
                    </p>
                  </div>
                ) : aiError ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="size-4 text-red-400 mt-0.5 shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm text-red-400">{aiError}</p>
                        <button
                          onClick={fetchRecommendations}
                          className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((candidate) => (
                      <div
                        key={candidate.userId}
                        className="group border border-white/5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-xl p-5 space-y-4 transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <Link
                              href={`/dashboard/${candidate.githubUsername}`}
                              className="font-semibold text-lg text-zinc-100 hover:text-[#d8b4fe] transition-colors flex items-center gap-2"
                            >
                              <Avatar className="size-6 border border-white/10">
                                <AvatarImage
                                  src={candidate.avatar}
                                  alt={candidate.githubUsername}
                                />
                                <AvatarFallback className="text-xs bg-zinc-800 text-zinc-300">
                                  {candidate.githubUsername?.[0]?.toUpperCase() ||
                                    "?"}
                                </AvatarFallback>
                              </Avatar>
                              @{candidate.githubUsername || "unknown"}
                              <Badge
                                variant="outline"
                                className={`ml-2 text-xs border-white/10 ${candidate.score >= 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-zinc-400"}`}
                              >
                                {candidate.score}% Match
                              </Badge>
                            </Link>
                            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                              {candidate.reason}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant={
                              inviteStatus[candidate.userId] === "success"
                                ? "secondary"
                                : "outline"
                            }
                            className={`shrink-0 transition-all ${inviteStatus[candidate.userId] === "success" ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30" : "bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"}`}
                            onClick={() => handleInvite(candidate.userId)}
                            disabled={
                              inviteStatus[candidate.userId] === "loading" ||
                              inviteStatus[candidate.userId] === "success"
                            }
                          >
                            {inviteStatus[candidate.userId] === "loading" ? (
                              <>
                                <Loader2 className="size-3 mr-2 animate-spin" />{" "}
                                Sending...
                              </>
                            ) : inviteStatus[candidate.userId] === "success" ? (
                              <>
                                <Check className="size-3 mr-2" /> Invited
                              </>
                            ) : (
                              <>
                                <Send className="size-3 mr-2" /> Invite
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${getSimilarityColor(candidate.score)}`}
                            style={{ width: `${candidate.score}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 text-center">
                      <Button
                        variant="ghost"
                        className="text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        onClick={() => setRecommendations([])}
                      >
                        Clear Results
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SIDEBAR ================= */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-white/5 bg-black/20 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-4 border-b border-white/5 px-6 pt-6">
              <CardTitle className="text-lg font-semibold text-zinc-200">
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Owner Info */}
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                  Project Owner
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="size-8 border border-white/10 shrink-0">
                      <AvatarImage
                        src={project.owner.avatar}
                        alt={project.owner.githubUsername}
                      />
                      <AvatarFallback className="text-xs bg-zinc-800 text-zinc-300">
                        {(project?.owner?.githubUsername ||
                          "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <Link
                        href={`/dashboard/${project.owner?.githubUsername}`}
                        className="font-semibold text-sm text-zinc-200 hover:text-[#d8b4fe] transition-colors flex items-center gap-1"
                      >
                        @{project.owner.githubUsername || "Unknown User"}
                      </Link>
                    </div>
                  </div>

                  {/* NEW MESSAGE BUTTON */}
                  {!isOwner && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="shrink-0 bg-[#d8b4fe]/10 text-[#d8b4fe] hover:bg-[#d8b4fe]/20"
                      onClick={() => handleStartChat(project.owner._id)}
                      disabled={startingChat}
                    >
                      {startingChat ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        "Message"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-400 font-medium">
                    <Users className="size-4" /> Team Size
                  </span>
                  <span className="font-semibold text-zinc-200 bg-white/5 px-2 py-0.5 rounded">
                    {teamMembers.length} / {project.maxTeamSize}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-400 font-medium">
                    <Calendar className="size-4" /> Created On
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {new Date(project.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Dynamic Call to Actions */}
              <div className="pt-2">
                {isOwner ? (
                  <div className="space-y-3">
                    <Badge className="w-full justify-center py-2 bg-[#d8b4fe]/20 text-[#d8b4fe] hover:bg-[#d8b4fe]/20 border border-[#d8b4fe]/30 font-semibold text-sm">
                      You are the Owner
                    </Badge>
                    <Link
                      href={`/projects/${projectId}/settings`}
                      className="block"
                    >
                      <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors py-6">
                        <Settings className="size-4 mr-2" /> Manage Project
                        Settings
                      </Button>
                    </Link>
                  </div>
                ) : userRole ? (
                  <div className="space-y-3">
                    <Badge className="w-full justify-center py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 font-semibold text-sm">
                      You are a Member ({userRole})
                    </Badge>
                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors py-6">
                      Enter Team Workspace
                    </Button>
                  </div>
                ) : project.status === "recruiting" ? (
                  <Link href={`/projects/${projectId}/apply`} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 py-6 text-base font-semibold">
                      Apply to Join Team
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full bg-zinc-800 text-zinc-500 py-6 font-semibold"
                    disabled
                  >
                    Applications Closed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
