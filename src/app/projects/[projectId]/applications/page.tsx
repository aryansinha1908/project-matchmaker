"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

interface Applicant {
  _id: string;
  githubUsername?: string;
  email: string;
  avatar?: string;
}

interface ApplicationData {
  _id: string;
  applicant: Applicant;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export default function ApplicationDashboard() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await fetch(`/api/projects/${projectId}/applications`);
        const json = await res.json();

        if (!res.ok)
          throw new Error(json.message || "Failed to load applications");

        setApplications(json.applications);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) loadApplications();
  }, [projectId]);

  const handleAction = async (
    application: ApplicationData,
    actionStatus: "accepted" | "rejected",
  ) => {
    setProcessingId(application._id);
    try {
      const appRes = await fetch(`/api/projects/${projectId}/applications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application._id,
          status: actionStatus,
        }),
      });

      if (!appRes.ok) throw new Error("Failed to update application status");

      if (actionStatus === "accepted") {
        const memRes = await fetch("/api/membership", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: application.applicant._id,
            projectId: projectId,
            role: "member",
          }),
        });

        if (!memRes.ok) {
          console.error(
            "Membership creation failed, but application was marked accepted.",
          );
          const fixRes = await fetch(
            `/api/projects/${projectId}/applications`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                applicationId: application._id,
                status: "pending",
              }),
            },
          );
          if (!fixRes.ok) throw new Error("Failed to fix application status");
        }
      }

      setApplications((prev) =>
        prev.map((app) =>
          app._id === application._id ? { ...app, status: actionStatus } : app,
        ),
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
        <p className="text-destructive text-lg">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors w-fit mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Project
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Review Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage requests from users wanting to join your team.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <CardHeader>
            <CardTitle className="text-xl text-muted-foreground">
              No applications yet
            </CardTitle>
            <CardDescription>
              When users apply to your project, they will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card
              key={app._id}
              className={
                app.status !== "pending" ? "opacity-75 bg-muted/30" : ""
              }
            >
              <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                {/* User Info Column */}
                <div className="flex flex-col items-center sm:items-start sm:w-48 shrink-0 space-y-3">
                  <Avatar className="size-16">
                    <AvatarImage src={app.applicant.avatar} />
                    <AvatarFallback className="text-lg">
                      {(app.applicant.avatar ||
                        app.applicant.email ||
                        "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left overflow-hidden w-full">
                    <p
                      className="font-semibold truncate"
                      title={app.applicant.githubUsername}
                    >
                      {app.applicant.githubUsername || "Unknown User"}
                    </p>
                    <p
                      className="text-xs text-muted-foreground truncate"
                      title={app.applicant.email}
                    >
                      {app.applicant.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Message & Actions Column */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2">
                      Application Message
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md min-h-[80px]">
                      {app.message || (
                        <span className="italic">No message provided.</span>
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge
                      variant={
                        app.status === "pending"
                          ? "outline"
                          : app.status === "accepted"
                            ? "default"
                            : "destructive"
                      }
                      className={`capitalize ${app.status === "accepted" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    >
                      {app.status}
                    </Badge>

                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={processingId === app._id}
                          onClick={() => handleAction(app, "rejected")}
                        >
                          {processingId === app._id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <X className="size-4 mr-1" />
                          )}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={processingId === app._id}
                          onClick={() => handleAction(app, "accepted")}
                        >
                          {processingId === app._id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4 mr-1" />
                          )}
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
