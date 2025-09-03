"use client";

import { useState, useMemo, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Image from "next/image";
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
  createdAt?: string;
  updatedAt?: string;
}

async function fetchAllProjects(userId: string): Promise<Project[]> {
  if (!userId) return [];
  const res = await fetch(`http://localhost:8787/api/project/${userId}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load projects");
  const json = await res.json();
  // Adjust mapping if API shape differs
  if (Array.isArray(json)) return json as Project[];
  if (Array.isArray(json.data)) return json.data as Project[];
  return [];
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

  // Derive unique categories & tags from full set
  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(projectsRaw.map((p) => p.category).filter(Boolean) as string[])
      ),
    [projectsRaw]
  );
  const uniqueTags = useMemo(
    () =>
      Array.from(
        new Set(
          projectsRaw
            .flatMap((p) => p.tags || [])
            .filter(Boolean)
            .map((t) => t.trim())
        )
      ),
    [projectsRaw]
  );

  // Client-side filtering
  const projects = useMemo(
    () =>
      projectsRaw.filter((p) => {
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
    [projectsRaw, category, tag, search]
  );

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">
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
            onClick={() => {
              setSearchInput("");
              setCategory("");
              setTag("");
              refetch();
            }}
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
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
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
                  ))
                : projects.map((p) => (
                    <Card
                      key={p.id}
                      className="group relative flex flex-col overflow-hidden border shadow-sm transition hover:shadow-md"
                    >
                      <div className="relative h-44 w-full bg-muted">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.title}
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
                        {p.category && (
                          <span className="absolute left-2 top-2 rounded bg-primary/85 px-2 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <CardHeader className="space-y-2">
                        <CardTitle className="line-clamp-1 pr-8 text-lg">
                          {p.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                          {p.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.tags?.slice(0, 4).map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-xs"
                            >
                              {t}
                            </Badge>
                          ))}
                          {p.tags && p.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{p.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="mt-auto space-y-3 pb-0">
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {p.date && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {p.date}
                            </span>
                          )}
                          {p.github && (
                            <a
                              href={p.github}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 hover:text-foreground"
                            >
                              <Github className="h-3 w-3" />
                              BrainCircuit
                            </a>
                          )}
                          {p.projectUrl && (
                            <a
                              href={p.projectUrl}
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
                          onClick={() =>
                            (window.location.href = `/project/${p.id}`)
                          }
                        >
                          Details
                          <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
