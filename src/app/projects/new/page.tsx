"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Game Development",
  "Open Source",
  "Research",
  "Design",
  "Other",
];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState("");

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  function addTag(value: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput("");
  }

  function removeTag(index: number, list: string[], setList: (v: string[]) => void) {
    setList(list.filter((_, i) => i !== index));
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>, list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input, list, setList, setInput);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title || !description || !category || !maxTeamSize) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          maxTeamSize: Number(maxTeamSize),
          requiredSkills: skills,
          requiredRoles: roles,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
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
      <div className="relative w-full max-w-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/15 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -z-10" />

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Project</CardTitle>
            <CardDescription>
              Fill in the details below to start recruiting collaborators.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Project Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. AI-powered Code Reviewer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, its goals, and what you're building..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Category + Max Team Size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTeamSize">
                    Max Team Size <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="maxTeamSize"
                    type="number"
                    min={1}
                    max={50}
                    placeholder="e.g. 5"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(e.target.value)}
                  />
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. React, Python (press Enter to add)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => handleTagKeyDown(e, skills, setSkills, skillInput, setSkillInput)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addTag(skillInput, skills, setSkills, setSkillInput)}
                  >
                    <Plus />
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeTag(i, skills, setSkills)}
                          className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Required Roles */}
              <div className="space-y-2">
                <Label>Required Roles</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Frontend Dev, Designer (press Enter to add)"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => handleTagKeyDown(e, roles, setRoles, roleInput, setRoleInput)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addTag(roleInput, roles, setRoles, setRoleInput)}
                  >
                    <Plus />
                  </Button>
                </div>
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {roles.map((role, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {role}
                        <button
                          type="button"
                          onClick={() => removeTag(i, roles, setRoles)}
                          className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Actions */}
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
                      Creating...
                    </>
                  ) : (
                    "Create Project"
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
