"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Loader2,
  ArrowLeft,
  Code,
  Briefcase,
  Rocket,
} from "lucide-react";

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

  function addTag(
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void,
  ) {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput("");
  }

  function removeTag(
    index: number,
    list: string[],
    setList: (v: string[]) => void,
  ) {
    setList(list.filter((_, i) => i !== index));
  }

  function handleTagKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    list: string[],
    setList: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void,
  ) {
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
    <PageContainer className="py-10 relative flex flex-col items-center min-h-[calc(100vh-4rem)] space-y-8">
      {/* Premium Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-3xl space-y-6">
        {/* Top Navigation */}
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-100 flex items-center gap-2 transition-colors w-fit group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        {/* Main Card */}
        <Card className="border-white/5 bg-black/20 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="pb-6 border-b border-white/5 px-6 pt-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner">
                <Rocket className="size-5 text-[#d8b4fe]" />
              </div>
              <CardTitle className="text-3xl font-bold text-zinc-100">
                Create a New Project
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400 text-base ml-13">
              Fill in the details below to start recruiting collaborators and
              building your team.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-zinc-300 font-medium">
                  Project Title <span className="text-[#d8b4fe]">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. AI-powered Code Reviewer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black/40 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-[#d8b4fe]/50 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="description"
                  className="text-zinc-300 font-medium"
                >
                  Description <span className="text-[#d8b4fe]">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, its goals, and what you're building..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="bg-black/40 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-[#d8b4fe]/50 resize-none transition-all"
                />
              </div>

              {/* Category + Max Team Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-zinc-300 font-medium">
                    Category <span className="text-[#d8b4fe]">*</span>
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v ?? "")}
                  >
                    <SelectTrigger className="w-full bg-black/40 border-white/10 text-zinc-100 focus:ring-[#d8b4fe]/50 transition-all">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-zinc-100">
                      {CATEGORIES.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="focus:bg-white/10 focus:text-white cursor-pointer"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="maxTeamSize"
                    className="text-zinc-300 font-medium"
                  >
                    Max Team Size <span className="text-[#d8b4fe]">*</span>
                  </Label>
                  <Input
                    id="maxTeamSize"
                    type="number"
                    min={1}
                    max={50}
                    placeholder="e.g. 5"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(e.target.value)}
                    className="bg-black/40 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-[#d8b4fe]/50 transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Required Skills */}
                <div className="space-y-3">
                  <Label className="text-zinc-300 font-medium flex items-center gap-2">
                    <Code className="size-4 text-emerald-400" /> Required Skills
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. React, Python"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) =>
                        handleTagKeyDown(
                          e,
                          skills,
                          setSkills,
                          skillInput,
                          setSkillInput,
                        )
                      }
                      className="bg-black/40 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 transition-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        addTag(skillInput, skills, setSkills, setSkillInput)
                      }
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300 shrink-0"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skills.map((skill, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 gap-1 pl-2.5 pr-1 py-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeTag(i, skills, setSkills)}
                            className="ml-1 rounded-full hover:bg-emerald-500/20 p-0.5 text-emerald-400 transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Required Roles */}
                <div className="space-y-3">
                  <Label className="text-zinc-300 font-medium flex items-center gap-2">
                    <Briefcase className="size-4 text-blue-400" /> Required
                    Roles
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Frontend Dev, Designer"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      onKeyDown={(e) =>
                        handleTagKeyDown(
                          e,
                          roles,
                          setRoles,
                          roleInput,
                          setRoleInput,
                        )
                      }
                      className="bg-black/40 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500/50 transition-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        addTag(roleInput, roles, setRoles, setRoleInput)
                      }
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300 shrink-0"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {roles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {roles.map((role, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-blue-500/10 text-blue-300 border-blue-500/20 gap-1 pl-2.5 pr-1 py-1"
                        >
                          {role}
                          <button
                            type="button"
                            onClick={() => removeTag(i, roles, setRoles)}
                            className="ml-1 rounded-full hover:bg-blue-500/20 p-0.5 text-blue-400 transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 font-medium">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white py-6"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#c084fc] to-[#d8b4fe] hover:from-[#a855f7] hover:to-[#c084fc] text-black font-bold shadow-lg shadow-purple-500/20 py-6 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin size-5 mr-2" />
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
