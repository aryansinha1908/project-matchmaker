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
import {
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  Settings,
} from "lucide-react";
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
        <Loader2 className="animate-spin size-8 text-[#d8b4fe]" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 relative max-w-3xl space-y-8">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Back navigation */}
      <Link
        href="/dashboard"
        className="text-sm text-zinc-400 flex items-center gap-2 hover:text-[#d8b4fe] transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
          <Settings className="size-10 text-[#d8b4fe]" />
          Profile Settings
        </h1>
        <p className="text-zinc-400 text-lg">
          Manage your public profile and availability.
        </p>
      </div>

      {/* Settings Form Card */}
      <Card className="border-white/5 bg-black/40 backdrop-blur-md shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-xl font-bold text-zinc-100">
              Personal Information
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Update how you appear to other developers on the platform.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Status Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Availability Status
              </label>
              <Select value={status} onValueChange={setStatus as any}>
                <SelectTrigger className="w-full bg-black/40 border-white/10 text-zinc-200 focus:ring-purple-500/50">
                  <SelectValue placeholder="Select your status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
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

            {/* Technical Skills Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Technical Skills (Comma separated)
              </label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Python, Figma"
                className="bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
              />
              <p className="text-xs text-zinc-500">
                These will be displayed as badges on your profile.
              </p>
            </div>

            {/* Custom Bio Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Custom Bio
              </label>
              <Textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community a bit about yourself..."
                className="resize-none bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
              />
            </div>

            {/* Alert Notifications */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md backdrop-blur-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-md backdrop-blur-sm">
                Profile updated successfully!
              </div>
            )}
          </CardContent>

          {/* Form Actions Footer */}
          <CardFooter className="p-6 border-t border-white/5 flex justify-end gap-3">
            <Link href="/dashboard">
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
                  <Save className="mr-2 size-4" /> Save Profile
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-md mt-8">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2 font-bold">
            <AlertTriangle className="size-5" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-red-400/60">
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">
              Once you delete your account, there is no going back. Please be
              certain. All your projects, applications, and team memberships
              will be wiped.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              <Trash2 className="mr-2 size-4" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
