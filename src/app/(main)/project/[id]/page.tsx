"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Edit,
  ArrowLeft,
  FolderOpen,
  Calendar,
  Tag,
  FileText,
  Image as ImageIcon,
  Github,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import ProjectForm from "@/components/forms/project-form";
import { ProjectFormValues } from "@/components/forms/form-schemas/project-schema";
import { appendMetadataToFormData, parseMetadataJson } from "@/lib/metadata-formdata";

// Types
interface Project {
  id: string;
  title: string;
  date?: string;
  description: string;
  image?: string;
  tags?: string[];
  category: string;
  github?: string;
  projectUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

// Helper function to convert form data to FormData
const toFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "metadataJson") return;

    if (value === undefined || value === null) return;

    // Handle array values
    if (Array.isArray(value)) {
      // Array of Files (e.g. [File])
      if (value.length && value.every((v) => v instanceof File)) {
        value.forEach((file) => formData.append(key, file));
      } else {
        // Primitive/string arrays (e.g. tags)
        value.forEach((v) => formData.append(`${key}[]`, String(v)));
      }
      return;
    }

    // Single File
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    // Other primitives
    formData.append(key, String(value));
  });

  appendMetadataToFormData(
    formData,
    parseMetadataJson(typeof data.metadataJson === "string" ? data.metadataJson : "")
  );

  return formData;
};

// API Functions
const fetchProject = async (id: string): Promise<Project> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/id/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }

  const data = await response.json();
  const project = data?.data || data;

  // Ensure tags is always an array
  if (project && project.tags) {
    if (typeof project.tags === "string") {
      project.tags = project.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean);
    } else if (!Array.isArray(project.tags)) {
      project.tags = [];
    }
  } else if (project) {
    project.tags = [];
  }

  return project;
};

const updateProject = async (
  id: string,
  data: ProjectFormValues
): Promise<{ success?: boolean; message?: string }> => {
  const formData = toFormData(data);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
    {
      method: "PUT",
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update project: ${response.statusText}`);
  }

  return response.json();
};

const deleteProject = async (id: string): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.statusText}`);
  }
};

// Loading Component
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading project details...</p>
      </div>
    </div>
  );
}

// Error Component
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6 text-center space-y-4">
        <div className="text-destructive">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold">Unable to Load Project</h3>
          <p className="text-sm text-muted-foreground mt-2">{message}</p>
        </div>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

// View Mode Component
function ProjectView({
  project,
  onEdit,
  onDelete,
  isDeleting,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">{project.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {project.category}
              </Badge>
              {project.date && (
                <Badge variant="outline" className="text-sm">
                  {project.date}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onEdit}
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={onDelete}
              size="sm"
              variant="destructive"
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Project Image */}
        {project.image && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Project Image
            </div>
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={project.image}
                alt={`${project.title} preview`}
                width={800}
                height={400}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              Category
            </div>
            <p className="text-lg font-medium">{project.category}</p>
          </div>

          {project.date && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Date
              </div>
              <p className="text-lg font-medium">{project.date}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Description
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        {project.tags &&
          Array.isArray(project.tags) &&
          project.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={`tag-${index}-${tag}`} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

        {/* Links */}
        {(project.github || project.projectUrl) && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Links
              </div>
              <div className="flex flex-wrap gap-3">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span className="text-sm">GitHub</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Live Project</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}

        {/* Metadata */}
        {(project.createdAt || project.updatedAt) && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>ID: {project.id}</span>
              {project.createdAt && <span>Created: {project.createdAt}</span>}
              {project.updatedAt && <span>Updated: {project.updatedAt}</span>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Main Component
export default function ProjectDetailPage() {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  const userId = session?.user?.id;
  const projectId = params?.id as string;

  // Fetch project data
  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    retry: 2,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      setMode("view");
      alert("Project updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Update failed:", error);
      alert(error.message || "Failed to update project");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      alert("Project deleted successfully!");
      router.push("/project");
    },
    onError: (error: Error) => {
      console.error("Delete failed:", error);
      alert(error.message || "Failed to delete project");
    },
  });

  // Event Handlers
  const handleEdit = () => setMode("edit");
  const handleCancelEdit = () => setMode("view");
  const handleBack = () => router.push("/project");

  const handleDelete = () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }
    deleteMutation.mutate();
  };

  const handleSubmit = async (data: ProjectFormValues): Promise<void> => {
    await updateMutation.mutateAsync(data);
  };

  const handleSuccess = (data: ProjectFormValues) => {
    console.log("Project updated successfully:", data);
  };

  const handleError = (error: Error) => {
    console.error("Form error:", error);
  };

  // Authentication Check
  if (status === "loading") {
    return <LoadingState />;
  }

  if (!session || !userId) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p>Please sign in to view project details.</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading State
  if (isLoading) {
    return <LoadingState />;
  }

  // Error State
  if (isError || !project) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load project";

    return <ErrorState message={errorMessage} onRetry={() => refetch()} />;
  }

  // Convert project data to form values
  const projectFormValues: Partial<ProjectFormValues> = {
    title: project.title,
    date: project.date || "",
    description: project.description,
    tags: Array.isArray(project.tags) ? project.tags : [],
    category: project.category,
    github: project.github || "",
    projectUrl: project.projectUrl || "",
    metadataJson: project.metadata ? JSON.stringify(project.metadata, null, 2) : "",
    // Note: img is handled separately as it's a file upload
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>

        <div className="flex items-center gap-2">
          {mode === "view" ? (
            <Eye className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Edit className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground capitalize">
            {mode} Mode
          </span>
        </div>
      </div>

      {/* Content */}
      {mode === "view" ? (
        <ProjectView
          project={project}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Edit Project</h1>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>

          <ProjectForm
            mode="edit"
            initialValues={projectFormValues}
            existingImageUrl={project.image}
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            onError={handleError}
            isLoading={updateMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
