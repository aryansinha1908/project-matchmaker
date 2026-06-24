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
import { Loader2, ArrowLeft, Save, AlertTriangle } from "lucide-react";
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
      alert("Invite sent!");
      setInviteEmail("");
    } else {
      alert(data.message); // e.g. "User not found"
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </PageContainer>
    );
  }

  if (error && !title) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
        <AlertTriangle className="size-12 text-destructive" />
        <p className="text-destructive text-lg">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 max-w-3xl space-y-6">
      <Link
        href={`/projects/${projectId}`}
        className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Project
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Project Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Update your project details and recruitment status.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Changes will be reflected immediately across the platform.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Title</label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scalable Chat App"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you building?"
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={category}
                  onValueChange={setCategory as any}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="ai">AI & Machine Learning</SelectItem>
                    <SelectItem value="game">Game Development</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project Status</label>
                <Select
                  value={status}
                  onValueChange={setStatus as any}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
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
                <label className="text-sm font-medium">
                  Required Skills (Comma separated)
                </label>
                <Input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Required Roles (Comma separated)
                </label>
                <Input
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  placeholder="Frontend, Backend, Designer"
                />
              </div>
            </div>

            <div className="space-y-2 w-full md:w-1/2 md:pr-3">
              <label className="text-sm font-medium">Max Team Size</label>
              <Input
                type="number"
                min="1"
                max="50"
                required
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(parseInt(e.target.value))}
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter user email..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button onClick={sendInvite}>Invite</Button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-md">
                Project settings updated successfully!
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-6 flex justify-end gap-3">
            <Link href={`/projects/${projectId}`}>
              <Button type="button" variant="ghost" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
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
