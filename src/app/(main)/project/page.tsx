"use client";

import { useState, useMemo, useEffect } from "react";
import { useInfiniteQuery, useQuery, useMutation } from "@tanstack/react-query";
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
  const res = await fetch(`http://localhost:8787/api/projects/${userId}`);
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
  const res = await fetch(`http://localhost:8787/api/projects/reorder`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  });
  if (!res.ok) throw new Error("Failed to update positions");
  return res.json();
}

// Sortable Project Card Component
function SortableProjectCard({ project }: { project: Project }) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col overflow-hidden border shadow-sm transition hover:shadow-md"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-10 cursor-grab active:cursor-grabbing rounded bg-background/90 p-1.5 shadow-sm border hover:bg-accent transition-colors"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="relative h-44 w-full bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <FolderGit2 className="h-10 w-10" />
          </div>
        )}
        {project.category && (
          <span className="absolute right-2 top-2 rounded bg-primary/85 px-2 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
            {project.category}
          </span>
        )}
      </div>
      <CardHeader className="space-y-2">
        <CardTitle className="line-clamp-1 pr-8 text-lg">
          {project.title}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
          {project.description}
        </CardDescription>
        <div className="flex flex-wrap gap-1 pt-1">
          {project.tags?.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
          {project.tags && project.tags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.tags.length - 4}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="mt-auto space-y-3 pb-0">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {project.date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {project.date}
            </span>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Github className="h-3 w-3" />
              GitHub
            </a>
          )}
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Globe2 className="h-3 w-3" />
              Live
            </a>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => (window.location.href = `/project/${project.id}`)}
        >
          Details
          <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ProjectsPage() {
  const userId = "111316734788280692226";

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
    queryKey: ["projects-all", userId],
    queryFn: () => fetchAllProjects(userId),
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
    mutationFn: (order: string[]) =>
      updateProjectsPosition(userId, order),
    onSuccess: (data) => {
      setHasChanges(false);
      // Optional: Directly update the state with returned data to avoid an extra refetch
      setProjectOrder(data);
      refetch();
    },
  });

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

  const isFiltered = search || category || tag;

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">
      {/* Save button - Fixed at top when changes detected */}
      {hasChanges && !isFiltered && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2">
          <Card className="shadow-lg border-primary">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-sm">Unsaved Changes</p>
                <p className="text-xs text-muted-foreground">
                  Save to update project order
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={savePositionsMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePositions}
                  disabled={savePositionsMutation.isPending}
                >
                  {savePositionsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Order
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderGit2 className="h-7 w-7 text-primary" />
            Projects
          </h1>
          <p className="text-muted-foreground">
            Explore and manage your portfolio projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Reset
          </Button>
          <Button onClick={() => (window.location.href = "/project/create")}>
            New Project
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="col-span-1 space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-2 font-medium">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search..."
                className="pl-8"
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1 mb-2">
                <Layers className="h-4 w-4" />
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={category ? "outline" : "default"}
                  className="cursor-pointer"
                  onClick={() => setCategory("")}
                >
                  All
                </Badge>
                {uniqueCategories.map((c) => (
                  <Badge
                    key={c}
                    variant={category === c ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCategory(c === category ? "" : c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1 mb-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
                <Badge
                  variant={tag ? "outline" : "default"}
                  className="cursor-pointer"
                  onClick={() => setTag("")}
                >
                  All
                </Badge>
                {uniqueTags.map((t) => (
                  <Badge
                    key={t}
                    variant={tag === t ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setTag(t === tag ? "" : t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {isError && (
            <Card className="mb-6 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Failed to load
                </CardTitle>
                <CardDescription>
                  {(error as Error)?.message || "Try again later."}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => refetch()} variant="destructive">
                  Retry
                </Button>
              </CardFooter>
            </Card>
          )}

          {!isLoading && projects.length === 0 && !isError ? (
            <Card className="p-10 text-center">
              <CardContent className="space-y-3">
                <FolderGit2 className="mx-auto h-10 w-10 text-muted-foreground" />
                <h2 className="text-lg font-semibold">No projects found</h2>
                <p className="text-sm text-muted-foreground">
                  Create your first project to showcase your work.
                </p>
                <Button
                  onClick={() => (window.location.href = "/project/create")}
                >
                  Add Project
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Skeleton className="h-6 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={projects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
                disabled={isFiltered}
              >
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {projects.map((p) => (
                    <SortableProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </SortableContext>
              {isFiltered && projects.length > 0 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  💡 Tip: Clear filters to enable drag-and-drop reordering
                </p>
              )}
            </DndContext>
          )}
        </div>
      </section>
    </div>
  );
}
