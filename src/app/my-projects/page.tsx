"use client";

import { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Users, Search } from "lucide-react";
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
}

const STATUS_COLORS: Record<string, string> = {
  recruiting: "bg-green-500/20 text-green-400 border-green-500/30",
  active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  archived: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States - Initialized to empty strings to fix the "all" rendering bug
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [role, setRole] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      // Clean up empty params before sending
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status && status !== "all") params.append("status", status);
      if (category && category !== "all") params.append("category", category);
      if (skills) params.append("skills", skills);
      if (role) params.append("role", role);

      const res = await fetch(`/api/projects?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to load projects");

      setProjects(json.Projects || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, skills, role]);

  // Debounce effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProjects();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [loadProjects]);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setSkills("");
    setRole("");
  };

  const hasActiveFilters = search || status || category || skills || role;

  return (
    <PageContainer className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view the projects you own or have joined.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Create Project
          </Button>
        </Link>
      </div>

      {/* Filters & Search Section */}
      <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border shadow-sm">
        {/* Top Row: Search and Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or description..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 sm:w-auto w-full">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="recruiting">Recruiting</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web">Web Dev</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="ai">AI / ML</SelectItem>
                <SelectItem value="game">Game Dev</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bottom Row: Additional Array Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Filter by required skill (e.g. React)..."
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Filter by required role (e.g. Designer)..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1"
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="sm:w-auto w-full"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin size-8 text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
          <CardHeader>
            <CardTitle className="text-xl text-muted-foreground">
              No projects found
            </CardTitle>
            <CardDescription>
              Try adjusting your search or filters to find what you're looking
              for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Link href="/projects/new">
                <Button variant="outline">Start your first project</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="flex flex-col hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {project.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`capitalize text-xs whitespace-nowrap ${STATUS_COLORS[project.status] || ""}`}
                  >
                    {project.status}
                  </Badge>
                </div>
                <CardTitle
                  className="text-xl line-clamp-1"
                  title={project.title}
                >
                  {project.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2 h-10">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="mt-auto space-y-4 pt-4 border-t border-border/50">
                {/* Skills Preview */}
                {project.requiredSkills &&
                  project.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills.slice(0, 3).map((s, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {s}
                        </Badge>
                      ))}
                      {project.requiredSkills.length > 3 && (
                        <span className="text-xs text-muted-foreground ml-1 flex items-center">
                          +{project.requiredSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                {/* Footer Data */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div
                    className="flex items-center gap-1.5"
                    title="Max Team Size"
                  >
                    <Users className="size-4" />
                    <span>Up to {project.maxTeamSize}</span>
                  </div>
                  <span className="text-xs">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
