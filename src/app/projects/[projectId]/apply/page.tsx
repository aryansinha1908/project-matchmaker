"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ApplyToProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full text-center py-6 border-green-500/20">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="size-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Application Sent!</CardTitle>
            <CardDescription>
              The project owner will review your application soon. You will be
              notified if accepted.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/projects">
              <Button>Return to Projects</Button>
            </Link>
          </CardFooter>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-2xl py-8 space-y-6">
      <Link
        href={`/projects/${projectId}`}
        className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Project
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Join Project</CardTitle>
          <CardDescription>
            Send a brief message to the project owner explaining why you are a
            good fit for this team, highlighting your relevant skills and roles.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Application Message{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </label>
              <Textarea
                id="message"
                placeholder="I am a frontend developer with 2 years of React experience. I'd love to help build..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t pt-6">
            <Link href={`/projects/${projectId}`}>
              <Button variant="ghost" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  );
}
