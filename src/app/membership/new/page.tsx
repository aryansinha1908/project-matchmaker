"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function JoinProjectPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState("");
  const [newUser, setNewUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!projectId.trim() || !newUser.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projectId.trim(), newUser: newUser.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to join project");
      }

      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer className="flex items-start justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="relative w-full max-w-md">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/15 rounded-full blur-[80px] -z-10" />

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add Member to Project</CardTitle>
            <CardDescription>
              Enter the project ID and the user ID of the member you want to add.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectId">
                  Project ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectId"
                  placeholder="e.g. 6657f3c2a1b2c3d4e5f60001"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newUser">
                  User ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="newUser"
                  placeholder="e.g. 6657f3c2a1b2c3d4e5f60002"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
