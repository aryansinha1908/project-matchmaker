"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, ArrowLeft, Save, Trash2, AlertTriangle } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function UserSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // User State
  const [userId, setUserId] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState("available");
  const [skills, setSkills] = useState(""); // Kept as string for comma-separated input

  useEffect(() => {
    async function loadUserData() {
      try {
        // Fetch the current user's DB record
        const res = await fetch("/api/users/me");
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || "Failed to load profile");

        const user = json.user;
        setUserId(user._id);
        setBio(user.bio || "");
        setStatus(user.status || "available");
        setSkills(user.skills?.join(", ") || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Hit the dynamic PATCH route we created earlier
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          skills: skillsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "DANGER: Are you absolutely sure you want to delete your account? This will permanently erase your profile, memberships, applications, and any projects you own.",
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      // Sign the user out and redirect them to the home page
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 max-w-3xl space-y-6">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your public profile and availability.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update how you appear to other developers on the platform.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Availability Status</label>
              <Select value={status} onValueChange={setStatus as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="looking_for_team">
                    Looking for Team
                  </SelectItem>
                  <SelectItem value="looking_for_projects">
                    Looking for Projects
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Technical Skills (Comma separated)
              </label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Python, Figma"
              />
              <p className="text-xs text-muted-foreground">
                These will be displayed as badges on your profile.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Bio</label>
              <Textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community a bit about yourself..."
                className="resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-md">
                Profile updated successfully!
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-6 flex justify-end gap-3">
            <Link href="/dashboard">
              <Button type="button" variant="ghost" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#d8b4fe] hover:bg-[#c084fc] text-black"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" /> Save Profile
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/5 mt-8">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle className="size-5" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-red-400/80">
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground max-w-lg">
              Once you delete your account, there is no going back. Please be
              certain. All your projects, applications, and team memberships
              will be wiped.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="shrink-0"
            >
              <Trash2 className="mr-2 size-4" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
