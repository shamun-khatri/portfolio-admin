"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  Github,
  RefreshCw,
  FolderGit2,
  Filter,
  Calendar,
  Tag,
  Layers,
  Globe2,
  Search,
  GripVertical,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  category?: string;
  github?: string;
  projectUrl?: string;
  date?: string;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

async function fetchAllProjects(userId: string): Promise<Project[]> {
  if (!userId) return [];
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${userId}`, {
  });
  if (!res.ok) throw new Error("Failed to load projects");
  const json = await res.json();
  // Adjust mapping if API shape differs
  let projects: Project[] = [];
  if (Array.isArray(json)) projects = json as Project[];
  else if (Array.isArray(json.data)) projects = json.data as Project[];
  
  // Sort by position if available
  return projects.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
}

async function updateProjectsPosition(
  userId: string,
  order: string[]
): Promise<Project[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/reorder`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  });
  if (!res.ok) throw new Error("Failed to update positions");
  return res.json();
}

// Sortable Project Card Component
function SortableProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col overflow-hidden border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 transform hover:-translate-y-1 ${
        isDragging ? "shadow-2xl ring-2 ring-primary border-primary scale-[1.02] opacity-100 bg-background" : ""
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-3 top-3 z-20 cursor-grab active:cursor-grabbing rounded-lg bg-background/80 p-2 shadow-lg border border-border/50 hover:bg-accent transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="relative h-48 w-full bg-muted overflow-hidden">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="(max-width:768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <FolderGit2 className="h-12 w-12 text-blue-500/30" />
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {project.category && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-blue-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg">
            {project.category}
          </span>
        )}
      </div>

      <CardHeader className="space-y-3 p-5">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-1 text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {project.title}
          </CardTitle>
        </div>
        
        <CardDescription className="line-clamp-2 text-sm leading-relaxed min-h-[40px]">
          {project.description}
        </CardDescription>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.tags?.slice(0, 3).map((t) => (
            <Badge 
              key={t} 
              variant="secondary" 
              className="text-[10px] font-semibold px-2 py-0 bg-blue-500/5 text-blue-600 dark:text-blue-400 border-none hover:bg-blue-500/10"
            >
              {t}
            </Badge>
          ))}
          {project.tags && project.tags.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 border-dashed">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="mt-auto p-5 pt-0">
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex gap-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-blue-500 transition-colors"
                title="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-blue-500 transition-colors"
                title="Live Demo"
              >
                <Globe2 className="h-5 w-5" />
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full text-xs font-semibold px-4 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
              onClick={() => (window.location.href = `/project/${project.id}`)}
            >
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Raw inputs (debounced for search)
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");

  const [search, setSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // State for managing positions
  const [projectOrder, setProjectOrder] = useState<Project[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    data: projectsRaw = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["projects-all", userId ?? ""],
    queryFn: () => fetchAllProjects(userId ?? ""),
    enabled: !!userId,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  // Initialize project order when data loads
  useEffect(() => {
    if (projectsRaw.length > 0) {
      setProjectOrder(projectsRaw);
      setHasChanges(false);
    }
  }, [projectsRaw]);

  // Mutation for saving positions
  const savePositionsMutation = useMutation({
    mutationFn: (order: string[]) => {
      if (!userId) return Promise.reject(new Error("No userId"));
      return updateProjectsPosition(userId, order);
    },
    onSuccess: (data) => {
      setHasChanges(false);
      // Optional: Directly update the state with returned data to avoid an extra refetch
      setProjectOrder(data);
      refetch();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  // Derive unique categories & tags from full set
  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(projectOrder.map((p) => p.category).filter(Boolean) as string[])
      ),
    [projectOrder]
  );
  const uniqueTags = useMemo(
    () =>
      Array.from(
        new Set(
          projectOrder
            .flatMap((p) => p.tags || [])
            .filter(Boolean)
            .map((t) => t.trim())
        )
      ),
    [projectOrder]
  );

  // Client-side filtering
  const projects = useMemo(
    () =>
      projectOrder.filter((p) => {
        if (category && p.category !== category) return false;
        if (tag && !(p.tags || []).includes(tag)) return false;
        if (search) {
          const s = search.toLowerCase();
          return (
            p.title.toLowerCase().includes(s) ||
            (p.description || "").toLowerCase().includes(s) ||
            (p.category || "").toLowerCase().includes(s) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(s))
          );
        }
        return true;
      }),
    [projectOrder, category, tag, search]
  );

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProjectOrder((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  const handleSavePositions = () => {
    const order = projectOrder.map((project) => project.id);
    savePositionsMutation.mutate(order);
  };

  const handleReset = () => {
    setSearchInput("");
    setCategory("");
    setTag("");
    setProjectOrder(projectsRaw);
    setHasChanges(false);
    refetch();
  };

  const isFiltered = Boolean(search || category || tag);

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-24 px-4 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <FolderGit2 className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            {(error as Error)?.message || "Failed to load projects. Please check your connection and try again."}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl px-8">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 p-4 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Save Order Notification */}
        {hasChanges && !isFiltered && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
            <Card className="shadow-2xl border-blue-500 bg-background/95 backdrop-blur-md px-6 py-4 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Save className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">Order Changed</p>
                  <p className="text-xs text-muted-foreground">Save to update portfolio appearance</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>Discard</Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSavePositions} disabled={savePositionsMutation.isPending}>
                  {savePositionsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Order"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl rotate-3">
              <FolderGit2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter">Projects</h1>
              <p className="text-muted-foreground text-lg">Manage your showcase</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()} className="h-12 border-border/50"><RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh</Button>
            <Button onClick={() => (window.location.href = "/project/create")} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20">+ Add Project</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <aside className="space-y-8">
            <Card className="p-6 rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl shadow-sm space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quick Search</label>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Filter by title..." className="pl-10 h-12 rounded-2xl bg-background/50 border-border/50" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} /></div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Categories</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={!category ? 'default' : 'outline'} className="cursor-pointer rounded-full px-4 py-1.5 transition-all" onClick={() => setCategory("")}>All</Badge>
                  {uniqueCategories.map(c => <Badge key={c} variant={category === c ? 'default' : 'outline'} className="cursor-pointer rounded-full px-4 py-1.5 transition-all" onClick={() => setCategory(c)}>{c}</Badge>)}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tech Stack</label>
                <div className="flex flex-wrap gap-2">{uniqueTags.map(t => <Badge key={t} variant={tag === t ? 'default' : 'outline'} className="cursor-pointer rounded-lg px-2 py-1 text-xs" onClick={() => setTag(t === tag ? "" : t)}>{t}</Badge>)}</div>
              </div>
              {(searchInput || category || tag) && <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:bg-blue-50 rounded-xl" onClick={handleReset}>Clear All Filters</Button>}
            </Card>
          </aside>

          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{[1,2,3,4].map(i => <Skeleton key={i} className="h-80 rounded-3xl shadow-sm" />)}</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-32 bg-card/30 rounded-[40px] border-2 border-dashed border-border/40 backdrop-blur-sm"><FolderGit2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" /><h3 className="text-2xl font-bold">No projects found</h3></div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy} disabled={isFiltered}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{projects.map(p => <SortableProjectCard key={p.id} project={p} onDelete={handleDelete} />)}</div>
                </SortableContext>
              </DndContext>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
