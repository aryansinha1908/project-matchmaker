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
import { Loader2, ArrowLeft, CheckCircle2, Send } from "lucide-react";
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

  // --------------------------------------------------------
  // SUCCESS STATE UI
  // --------------------------------------------------------
  if (success) {
    return (
      <PageContainer className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        {/* Success Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <Card className="max-w-md w-full border-white/5 bg-black/20 backdrop-blur-md shadow-xl overflow-hidden text-center py-8">
          <CardHeader className="space-y-4">
            <div className="flex justify-center mb-2 relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <CheckCircle2 className="size-16 text-emerald-400 relative z-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-zinc-100">
              Application Sent!
            </CardTitle>
            <CardDescription className="text-zinc-400 text-base px-4">
              The project owner will review your application soon. You will be
              notified if accepted.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-6">
            <Link href="/projects" className="w-full sm:w-auto">
              <Button className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-6 text-base font-semibold transition-all">
                Return to Projects
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </PageContainer>
    );
  }

  // --------------------------------------------------------
  // APPLICATION FORM UI
  // --------------------------------------------------------
  return (
    <PageContainer className="py-10 relative flex flex-col items-center min-h-[calc(100vh-4rem)] space-y-8">
      {/* Premium Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-2xl space-y-6">
        {/* Top Navigation */}
        <Link
          href={`/projects/${projectId}`}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-100 flex items-center gap-2 transition-colors w-fit group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Project
        </Link>

        {/* Main Card */}
        <Card className="border-white/5 bg-black/20 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="pb-6 border-b border-white/5 px-6 pt-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner">
                <Send className="size-5 text-[#d8b4fe]" />
              </div>
              <CardTitle className="text-3xl font-bold text-zinc-100">
                Join Project
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400 text-base ml-[52px]">
              Send a brief message to the project owner explaining why you are a
              good fit for this team, highlighting your relevant skills and
              roles.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2.5">
                <label
                  htmlFor="message"
                  className="text-zinc-300 font-medium block"
                >
                  Application Message{" "}
                  <span className="text-zinc-500 font-normal text-sm">
                    (Optional)
                  </span>
                </label>
                <Textarea
                  id="message"
                  placeholder="I am a frontend developer with 2 years of React experience. I'd love to help build..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="bg-black/40 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-[#d8b4fe]/50 resize-none transition-all"
                />
              </div>

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 font-medium">
                  {error}
                </div>
              )}
            </CardContent>

            {/* Actions */}
            <CardFooter className="flex gap-4 p-6 sm:px-8 border-t border-white/5 bg-black/20">
              <Link href={`/projects/${projectId}`} className="flex-1">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white py-6"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#c084fc] to-[#d8b4fe] hover:from-[#a855f7] hover:to-[#c084fc] text-black font-bold shadow-lg shadow-purple-500/20 py-6 text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
}
