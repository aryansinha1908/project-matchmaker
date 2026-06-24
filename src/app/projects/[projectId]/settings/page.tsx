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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  Save,
  AlertTriangle,
  Settings,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("recruiting");
  const [maxTeamSize, setMaxTeamSize] = useState<number | "">("");
  const [skills, setSkills] = useState(""); // Kept as string for the input field
  const [roles, setRoles] = useState(""); // Kept as string for the input field
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || "Failed to load project");

        // Security check: Kick them out if they aren't the owner
        if (!json.isOwner) {
          router.push(`/projects/${projectId}`);
          return;
        }

        const p = json.project;
        setTitle(p.title);
        setDescription(p.description);
        setCategory(p.category);
        setStatus(p.status);
        setMaxTeamSize(p.maxTeamSize);
        setSkills(p.requiredSkills?.join(", ") || "");
        setRoles(p.requiredRoles?.join(", ") || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) loadProject();
  }, [projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // Convert comma-separated strings back to arrays
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const rolesArray = roles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          status,
          maxTeamSize: Number(maxTeamSize),
          requiredSkills: skillsArray,
          requiredRoles: rolesArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update project");

      setSuccess(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail) return;

    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: projectId,
        invitedUserEmail: inviteEmail,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Invite sent successfully!");
      setInviteEmail("");
    } else {
      alert(data.message || "Failed to send invite"); // e.g. "User not found"
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin size-8 text-[#d8b4fe]" />
      </PageContainer>
    );
  }

  if (error && !title) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
        <div className="p-6 border border-red-500/20 bg-red-500/5 backdrop-blur-md rounded-xl flex flex-col items-center text-center">
          <AlertTriangle className="size-12 text-red-400 mb-4" />
          <p className="text-red-400 text-lg font-medium">{error}</p>
          <p className="text-red-400/70 text-sm mt-1 mb-6">
            Could not load the requested project data.
          </p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 relative max-w-3xl space-y-8">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Back navigation */}
      <Link
        href={`/projects/${projectId}`}
        className="text-sm text-zinc-400 flex items-center gap-2 hover:text-[#d8b4fe] transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Project
      </Link>

      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
          <Settings className="size-10 text-[#d8b4fe]" />
          Project Settings
        </h1>
        <p className="text-zinc-400 text-lg">
          Update your project details and recruitment status.
        </p>
      </div>

      <Card className="border-white/5 bg-black/40 backdrop-blur-md shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-xl font-bold text-zinc-100">
              General Information
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Changes will be reflected immediately across the platform.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Project Title
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scalable Chat App"
                className="bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Description
              </label>
              <Textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you building?"
                className="resize-none bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Category
                </label>
                <Select
                  value={category}
                  onValueChange={setCategory as any}
                  required
                >
                  <SelectTrigger className="w-full bg-black/40 border-white/10 text-zinc-200 focus:ring-purple-500/50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="ai">AI & Machine Learning</SelectItem>
                    <SelectItem value="game">Game Development</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Project Status
                </label>
                <Select
                  value={status}
                  onValueChange={setStatus as any}
                  required
                >
                  <SelectTrigger className="w-full bg-black/40 border-white/10 text-zinc-200 focus:ring-purple-500/50">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                    <SelectItem value="recruiting">
                      Recruiting (Accepting Applications)
                    </SelectItem>
                    <SelectItem value="active">
                      Active (Building in Progress)
                    </SelectItem>
                    <SelectItem value="completed">
                      Completed (Project Finished)
                    </SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Required Skills (Comma separated)
                </label>
                <Input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Required Roles (Comma separated)
                </label>
                <Input
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  placeholder="Frontend, Backend, Designer"
                  className="bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
                />
              </div>
            </div>

            <div className="space-y-2 w-full md:w-1/2 md:pr-3">
              <label className="text-sm font-medium text-zinc-300">
                Max Team Size
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                required
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(parseInt(e.target.value) || "")}
                className="bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
              />
            </div>

            {/* Invite Section */}
            <div className="space-y-2 pt-4 border-t border-white/5 mt-6">
              <label className="text-sm font-medium text-zinc-300">
                Direct Invite
              </label>
              <p className="text-xs text-zinc-500 mb-2">
                Invite a specific developer to join this project bypassing the
                application process.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter user email..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
                />
                <Button
                  type="button"
                  onClick={sendInvite}
                  disabled={!inviteEmail}
                  className="bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
                >
                  <Send className="size-4 mr-2" />
                  Invite
                </Button>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md backdrop-blur-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-md backdrop-blur-sm">
                Project settings updated successfully!
              </div>
            )}
          </CardContent>

          {/* Form Actions Footer */}
          <CardFooter className="p-6 border-t border-white/5 flex justify-end gap-3">
            <Link href={`/projects/${projectId}`}>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#d8b4fe] hover:bg-[#c084fc] text-black font-semibold shadow-lg shadow-purple-900/20"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  );
}
