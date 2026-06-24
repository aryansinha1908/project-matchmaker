"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Wallet,
  KanbanSquare,
  Library,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

const EXPENSE_COLORS = ["#d8b4fe", "#a855f7", "#7e22ce", "#c084fc", "#9333ea"];
const KANBAN_COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
];
const STATUS_COLORS: Record<string, string> = {
  recruiting: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function ProjectHubPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // -- Component States --
  const [tasks, setTasks] = useState<
    { _id: string; title: string; status: string }[]
  >([]);
  const [expenses, setExpenses] = useState<
    { _id: string; name: string; value: number; color: string }[]
  >([]);
  const [resources, setResources] = useState<
    { _id: string; name: string; url: string }[]
  >([]);

  // -- Form States --
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newExpense, setNewExpense] = useState({ name: "", amount: "" });
  const [newResource, setNewResource] = useState({ name: "", url: "" });
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchHubData() {
      if (!projectId) return;
      try {
        const [projectRes, membersRes, hubRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/memberships?projectId=${projectId}`),
          fetch(`/api/hub/${projectId}`),
        ]);

        const projectJson = await projectRes.json();
        const membersJson = await membersRes.json();
        const hubJson = await hubRes.json();

        if (!projectRes.ok)
          throw new Error(projectJson.message || "Failed to load project");

        setProject(projectJson.project || projectJson);
        const memberData =
          membersJson.memberships || membersJson.members || membersJson;
        setMembers(Array.isArray(memberData) ? memberData : []);

        setTasks(hubJson.tasks || []);
        setExpenses(hubJson.expenses || []);
        setResources(hubJson.resources || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHubData();
  }, [projectId]);

  // --- API HANDLERS ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggableId ? { ...t, status: destination.droppableId } : t,
      ),
    );

    await fetch(`/api/hub/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "task",
        id: draggableId,
        data: { status: destination.droppableId },
      }),
    });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const res = await fetch(`/api/hub/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "task",
        data: { title: newTaskTitle, status: "todo" },
      }),
    });

    if (res.ok) {
      const { doc } = await res.json();
      setTasks([...tasks, doc]);
      setNewTaskTitle("");
      setIsTaskDialogOpen(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name.trim() || !newExpense.amount) return;

    const res = await fetch(`/api/hub/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "expense",
        data: {
          name: newExpense.name,
          value: parseFloat(newExpense.amount),
          color: EXPENSE_COLORS[expenses.length % EXPENSE_COLORS.length],
        },
      }),
    });

    if (res.ok) {
      const { doc } = await res.json();
      setExpenses([...expenses, doc]);
      setNewExpense({ name: "", amount: "" });
      setIsExpenseDialogOpen(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.name.trim() || !newResource.url.trim()) return;

    const url = newResource.url.startsWith("http")
      ? newResource.url
      : `https://${newResource.url}`;

    const res = await fetch(`/api/hub/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "resource",
        data: { name: newResource.name, url },
      }),
    });

    if (res.ok) {
      const { doc } = await res.json();
      setResources([...resources, doc]);
      setNewResource({ name: "", url: "" });
      setIsResourceDialogOpen(false);
    }
  };

  if (loading || !isMounted) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin size-8 text-[#d8b4fe]" />
      </PageContainer>
    );
  }

  if (error || !project) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
          {error || "Project not found"}
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 relative space-y-6 max-w-7xl mx-auto">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
          {project.title}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400 font-medium">
            Project Status:
          </span>
          <Badge
            variant="outline"
            className={`capitalize ${STATUS_COLORS[project.status] || ""}`}
          >
            {project.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* KANBAN BOARD */}
          <Card className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-colors min-h-[400px]">
            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <KanbanSquare className="size-5 text-[#d8b4fe]" /> Kanban Board
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setIsTaskDialogOpen(true)}
                className="h-8 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
              >
                <Plus className="size-4 mr-1" /> Add Task
              </Button>
            </CardHeader>
            <CardContent className="p-4 overflow-x-auto">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[700px]">
                  {KANBAN_COLUMNS.map((column) => {
                    const columnTasks = tasks.filter(
                      (t) => t.status === column.id,
                    );
                    return (
                      <div key={column.id} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-zinc-400">
                            {column.label}
                          </h3>
                          <span className="text-xs bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full">
                            {columnTasks.length}
                          </span>
                        </div>
                        <Droppable droppableId={column.id}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`flex flex-col gap-2 h-full min-h-[150px] p-2 rounded-lg border transition-colors ${
                                snapshot.isDraggingOver
                                  ? "bg-white/5 border-purple-500/30"
                                  : "bg-zinc-950/50 border-white/5 border-dashed"
                              }`}
                            >
                              {columnTasks.map((task, index) => (
                                <Draggable
                                  key={task._id}
                                  draggableId={task._id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`flex items-start gap-2 bg-zinc-900 border p-3 rounded-lg shadow-sm transition-colors ${
                                        snapshot.isDragging
                                          ? "border-[#d8b4fe] z-50"
                                          : "border-white/10 hover:border-white/20"
                                      }`}
                                    >
                                      <GripVertical className="size-4 text-zinc-600 shrink-0 mt-0.5 cursor-grab active:cursor-grabbing" />
                                      <p className="text-sm text-zinc-200">
                                        {task.title}
                                      </p>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              {columnTasks.length === 0 &&
                                !snapshot.isDraggingOver && (
                                  <div className="text-center text-xs text-zinc-600 mt-4">
                                    Drop tasks here
                                  </div>
                                )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EXPENSE TRACKER */}
            <Card className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-colors">
              <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Wallet className="size-5 text-[#d8b4fe]" /> Expense Tracker
                </CardTitle>
                <Button
                  size="icon"
                  onClick={() => setIsExpenseDialogOpen(true)}
                  className="h-8 w-8 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
                >
                  <Plus className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center justify-center min-h-[250px]">
                {expenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-zinc-500 h-full w-full space-y-2 py-8">
                    <div className="size-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                      <Wallet className="size-6 opacity-40" />
                    </div>
                    <p className="text-xs">No expenses logged</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[150px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenses}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {expenses.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#18181b",
                              borderColor: "#27272a",
                              borderRadius: "8px",
                            }}
                            itemStyle={{ color: "#d8b4fe" }}
                            formatter={(value: any) => `$${value}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full mt-4 space-y-2 max-h-[100px] overflow-y-auto pr-2">
                      {expenses.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="size-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-zinc-400">{item.name}</span>
                          </div>
                          <span className="text-zinc-200 font-medium">
                            ${item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* RESOURCE VAULT */}
            <Card className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-colors">
              <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Library className="size-5 text-[#d8b4fe]" /> Resource Vault
                </CardTitle>
                <Button
                  size="icon"
                  onClick={() => setIsResourceDialogOpen(true)}
                  className="h-8 w-8 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
                >
                  <Plus className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-3 min-h-[250px] flex flex-col">
                {resources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-zinc-500 h-full w-full space-y-2 py-8 m-auto">
                    <Library className="size-10 opacity-40" />
                    <p className="text-xs">No resources added</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                    {resources.map((resource) => (
                      <a
                        key={resource._id}
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-white/5 hover:border-[#d8b4fe]/30 hover:bg-white/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-zinc-200">
                            {resource.name}
                          </span>
                        </div>
                        <ExternalLink className="size-3.5 text-zinc-500 group-hover:text-[#d8b4fe] transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 h-full">
          <Card className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-colors h-full sticky top-6 flex flex-col">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-xl font-bold text-zinc-100">
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8 flex-1">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Description
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Members ({members.length})
                </h4>
                {members.length > 0 ? (
                  <div className="flex flex-wrap -space-x-3 overflow-hidden p-1">
                    {members.map((member: any) => {
                      const user = member.user || member;
                      return (
                        <Link
                          key={member._id}
                          href={`/dashboard/${user.githubUsername}`}
                        >
                          <Avatar className="inline-block size-10 border-2 border-zinc-900 hover:z-10 relative transition-transform hover:scale-110">
                            <AvatarImage
                              src={user.avatar}
                              alt={user.githubUsername}
                            />
                            <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
                              {user.githubUsername?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    No members yet.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills?.length > 0 ? (
                    project.requiredSkills.map((skill: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-white/5 border-white/10 text-zinc-200 font-normal"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      Not specified
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Required Roles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.requiredRoles?.length > 0 ? (
                    project.requiredRoles.map((role: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-[#d8b4fe]/5 border-[#d8b4fe]/20 text-[#d8b4fe] font-medium"
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      Not specified
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- MODALS --- */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="task">Task Title</Label>
              <Input
                id="task"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Setup Database Schema"
                className="bg-black/50 border-white/10"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#d8b4fe] text-black hover:bg-[#c084fc]"
            >
              Create Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Log New Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="expenseName">Expense Name</Label>
              <Input
                id="expenseName"
                value={newExpense.name}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, name: e.target.value })
                }
                placeholder="e.g., Vercel Hosting"
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                placeholder="20.00"
                className="bg-black/50 border-white/10"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#d8b4fe] text-black hover:bg-[#c084fc]"
            >
              Add Expense
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isResourceDialogOpen}
        onOpenChange={setIsResourceDialogOpen}
      >
        <DialogContent className="bg-zinc-950 border-white/10 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Add Resource Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddResource} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="resourceName">Resource Name</Label>
              <Input
                id="resourceName"
                value={newResource.name}
                onChange={(e) =>
                  setNewResource({ ...newResource, name: e.target.value })
                }
                placeholder="e.g., Figma Designs"
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resourceUrl">URL</Label>
              <Input
                id="resourceUrl"
                value={newResource.url}
                onChange={(e) =>
                  setNewResource({ ...newResource, url: e.target.value })
                }
                placeholder="https://..."
                className="bg-black/50 border-white/10"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#d8b4fe] text-black hover:bg-[#c084fc]"
            >
              Add Resource
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
