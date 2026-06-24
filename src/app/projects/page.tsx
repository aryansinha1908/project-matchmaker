"use client";

import { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  FolderKanban,
  ArrowRight,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface ProjectDisplay {
  _id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  requiredRoles: string[];
  maxTeamSize: number;
  status: "recruiting" | "active" | "completed" | "archived";
  createdAt: string;
  owner?: {
    githubUsername?: string;
    avatar?: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  recruiting: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function ExploreProjectsPage() {
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [roles, setRoles] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status && status !== "All Statuses")
        params.append("status", status.toLowerCase());
      if (category && category !== "All Categories")
        params.append("category", category);
      if (skills) params.append("skills", skills);
      if (roles) params.append("roles", roles);

      // Pointing to the global projects endpoint with query parameters
      const res = await fetch(`/api/projects?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to load projects");

      // Safety check: ensure we are setting an array to prevent crashes
      const fetchedProjects = json.Projects || json.projects || json;
      setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, skills, roles]);

  useEffect(() => {
    // Debounce the API call so we don't spam the server on every keystroke
    const delayDebounceFn = setTimeout(() => {
      loadProjects();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [loadProjects]);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setSkills("");
    setRoles("");
  };

  const hasActiveFilters = search || status || category || skills || roles;

  return (
    <PageContainer className="py-10 relative space-y-8">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            <FolderKanban className="size-10 text-[#d8b4fe]" />
            Explore Projects
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Discover and apply to projects across the community.
          </p>
        </div>

        <Link href="/projects/new">
          <Button className="bg-[#d8b4fe] hover:bg-[#c084fc] text-black font-semibold shadow-lg shadow-purple-900/20">
            Create Project
          </Button>
        </Link>
      </div>

      {/* ---------------- FILTERS BAR ---------------- */}
      <div className="flex flex-col gap-4 p-5 border border-white/5 bg-black/20 backdrop-blur-md rounded-xl shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              placeholder="Search by title or description..."
              className="pl-10 bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:w-auto w-full">
            <Select value={status} onValueChange={setStatus as any}>
              <SelectTrigger className="w-full sm:w-[160px] bg-black/40 border-white/10 text-zinc-200">
                <div className="flex items-center gap-2">
                  <Filter className="size-3.5 text-zinc-400" />
                  <SelectValue placeholder="All Statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="Recruiting">Recruiting</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory as any}>
              <SelectTrigger className="w-full sm:w-[160px] bg-black/40 border-white/10 text-zinc-200">
                <div className="flex items-center gap-2">
                  <Filter className="size-3.5 text-zinc-400" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Mobile Development">
                  Mobile Development
                </SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Machine Learning">
                  Machine Learning
                </SelectItem>
                <SelectItem value="Game Development">
                  Game Development
                </SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="Open Source">Open Source</SelectItem>
                <SelectItem value="Reasearch">Reasearch</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Filter skills (e.g. React, Node.js)..."
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="flex-1 bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
          />
          <Input
            placeholder="Filter roles (e.g. Designer, Backend)..."
            value={roles}
            onChange={(e) => setRoles(e.target.value)}
            className="flex-1 bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
          />

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="sm:w-auto w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* ---------------- PROJECTS GRID ---------------- */}
      {error ? (
        <div className="text-center py-20 border border-red-500/20 bg-red-500/5 rounded-xl backdrop-blur-sm">
          <p className="text-red-400 font-medium">{error}</p>
          <Button
            variant="outline"
            className="mt-4 border-red-500/20 text-red-400 hover:bg-red-500/10"
            onClick={loadProjects}
          >
            Retry
          </Button>
        </div>
      ) : loading && projects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin size-8 text-[#d8b4fe]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 border border-white/5 bg-black/20 rounded-xl backdrop-blur-sm flex flex-col items-center">
          <FolderKanban className="size-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300">
            No projects found
          </h3>
          <p className="text-zinc-500 mt-1 max-w-sm">
            We couldn't find any projects matching your current filters. Try
            adjusting your search criteria.
          </p>
          {hasActiveFilters && (
            <Button
              variant="link"
              className="text-[#d8b4fe] mt-4"
              onClick={clearFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {/* Overlay loader for when user is typing but we already have old data showing */}
          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="animate-spin size-8 text-[#d8b4fe]" />
            </div>
          )}

          {projects.map((project) => (
            <Card
              key={project._id}
              className="group border-white/5 bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 flex flex-col h-full"
            >
              <CardHeader className="pb-4 border-b border-white/5 px-5 pt-5">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <Badge
                    variant="outline"
                    className="bg-white/5 border-white/10 text-zinc-300 font-medium px-2 py-0.5 truncate max-w-[120px]"
                  >
                    {project.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`capitalize shrink-0 ${STATUS_COLORS[project.status] || ""}`}
                  >
                    {project.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-zinc-100 group-hover:text-[#d8b4fe] transition-colors line-clamp-2">
                  {project.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 flex-1 space-y-4">
                <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {project.requiredSkills &&
                  project.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.requiredSkills.slice(0, 4).map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-[10px] bg-white/[0.03] text-zinc-300 border-white/10 px-1.5 py-0"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {project.requiredSkills.length > 4 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-white/[0.03] text-zinc-500 border-white/10 px-1.5 py-0"
                        >
                          +{project.requiredSkills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
              </CardContent>

              <CardFooter className="p-5 pt-0 border-t border-white/5 mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2 mt-4">
                  <Avatar className="size-7 border border-white/10">
                    <AvatarImage src={project.owner?.avatar} />
                    <AvatarFallback className="text-[10px] bg-zinc-800 text-zinc-300">
                      {project.owner?.githubUsername?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider leading-none">
                      Owner
                    </span>
                    <Link
                      href={`/dashboard/${project.owner?.githubUsername}`}
                      className="text-xs text-zinc-300 font-medium leading-tight mt-0.5 max-w-[100px] truncate"
                    >
                      @{project.owner?.githubUsername || "unknown"}
                    </Link>
                  </div>
                </div>

                <Link href={`/projects/${project._id}`} className="mt-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#d8b4fe] hover:text-[#c084fc] hover:bg-[#d8b4fe]/10 p-0 px-3 h-8"
                  >
                    View{" "}
                    <ArrowRight className="size-3 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
