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
    username?: string;
    email: string;
    image?: string;
  };
}

interface ProjectData {
  project: ProjectDetails;
  currentTeamSize: number;
  userRole: string | null;
  isOwner: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  recruiting: "bg-green-500/20 text-green-400 border-green-500/30",
  active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  archived: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || "Failed to load project");

        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

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
        <p className="text-destructive text-lg">
          {error || "Project not found"}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </PageContainer>
    );
  }

  const { project, currentTeamSize, userRole, isOwner } = data;

  return (
    <PageContainer className="py-8 space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="text-sm">
                {project.category}
              </Badge>
              <Badge
                variant="outline"
                className={`capitalize text-sm ${STATUS_COLORS[project.status] || ""}`}
              >
                {project.status}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {project.title}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">About the Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="size-5 text-primary" />
                  Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.requiredSkills && project.requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No specific skills listed.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="size-5 text-primary" />
                  Required Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.requiredRoles && project.requiredRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.requiredRoles.map((role, idx) => (
                      <Badge key={idx} variant="outline">
                        {role}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No specific roles listed.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Owner Info */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">
                  Project Owner
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={project.owner.image}
                      alt={project.owner.username || "Owner"}
                    />
                    <AvatarFallback>
                      {(project?.owner?.username ||
                        project?.owner?.email ||
                        "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {project.owner.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate w-40">
                      {project.owner.email}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4" /> Team Size
                  </span>
                  <span className="font-medium">
                    {currentTeamSize} / {project.maxTeamSize}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" /> Created
                  </span>
                  <span className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Call to Actions based on Role */}
              <div className="pt-2">
                {isOwner ? (
                  <div className="space-y-3 text-center">
                    <Badge
                      className="w-full justify-center py-1.5"
                      variant="secondary"
                    >
                      You are the Owner
                    </Badge>
                    <Link
                      href={`/projects/${projectId}/settings`}
                      className="block"
                    >
                      <Button className="w-full" variant="outline">
                        <Settings className="size-4 mr-2" />
                        Manage Project
                      </Button>
                    </Link>
                  </div>
                ) : userRole ? (
                  <div className="space-y-3 text-center">
                    <Badge className="w-full justify-center py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      You are a Member ({userRole})
                    </Badge>
                    <Button className="w-full" variant="outline">
                      View Team Workspace
                    </Button>
                  </div>
                ) : project.status === "recruiting" ? (
                  <Link href={`/projects/${projectId}/apply`} className="block">
                    <Button className="w-full">Apply to Join</Button>
                  </Link>
                ) : (
                  <Button className="w-full" disabled>
                    Not Accepting Applications
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
