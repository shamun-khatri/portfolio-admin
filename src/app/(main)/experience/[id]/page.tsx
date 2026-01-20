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
  Briefcase,
  Building,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  Loader2,
  Trash2,
} from "lucide-react";
import ExperienceForm from "@/components/forms/experience-form";
import { ExperienceFormValues } from "@/components/forms/form-schemas/experience-schema";

// Types
interface Experience {
  _id: string;
  img: string;
  role: string;
  company: string;
  date: string;
  desc: string;
  skills?: string[];
}

// API Functions
const fetchExperience = async (
  userId: string,
  id: string
): Promise<Experience> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/experiences/${userId}/${id}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch experience entry: ${response.statusText}`);
  }

  return response.json();
};

const updateExperience = async (
  id: string,
  data: ExperienceFormValues
): Promise<{ success?: boolean; message?: string }> => {
  const formData = new FormData();

  formData.append("company", data.company);
  formData.append("role", data.role);
  formData.append("date", data.date);
  formData.append("desc", data.desc);

  if (data.img && data.img.length > 0) {
    formData.append("img", data.img[0]);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/experiences/${id}`,
    {
      method: "PUT",
      credentials: "include",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to update experience entry: ${response.statusText}`
    );
  }

  return response.json();
};

const deleteExperience = async (id: string): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/experiences/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete experience entry: ${response.statusText}`);
  }
};

// Loading Component
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading experience details...</p>
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
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold">Unable to Load Experience</h3>
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
function ExperienceView({
  experience,
  onEdit,
  onDelete,
  isMainDeleting,
}: {
  experience: Experience;
  onEdit: () => void;
  onDelete: () => void;
  isMainDeleting?: boolean;
}) {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">{experience.role}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-sm">
              {experience.company}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              disabled={isMainDeleting}
              className="flex items-center gap-2"
            >
              {isMainDeleting ? (
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
        {/* Company Image */}
        {experience.img && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Company Logo
            </div>
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={experience.img}
                alt={`${experience.company} logo`}
                width={800}
                height={200}
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Experience Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building className="h-4 w-4" />
              Company
            </div>
            <p className="text-lg font-medium">{experience.company}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Role/Position
            </div>
            <p className="text-lg font-medium">{experience.role}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Duration
            </div>
            <p className="text-lg font-medium">{experience.date}</p>
          </div>
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
              {experience.desc}
            </p>
          </div>
        </div>

        {/* Skills (if available) */}
        {experience.skills && experience.skills.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {experience.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Main Component
export default function ExperienceDetailPage() {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  const userId = session?.user?.id as string | undefined;
  const experienceId = params?.id as string;

  // Fetch experience data
  const {
    data: experience,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["experience", userId, experienceId],
    queryFn: () => fetchExperience(userId!, experienceId),
    enabled: !!userId && !!experienceId,
    retry: 2,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: ExperienceFormValues) =>
      updateExperience(experienceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      setMode("view");
      alert("Experience entry updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Update failed:", error);
      alert(error.message || "Failed to update experience entry");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteExperience(experienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      alert("Experience entry deleted successfully!");
      router.push("/experience");
    },
    onError: (error: Error) => {
      console.error("Delete failed:", error);
      alert(error.message || "Failed to delete experience entry");
    },
  });

  // Event Handlers
  const handleEdit = () => setMode("edit");
  const handleCancelEdit = () => setMode("view");
  const handleBack = () => router.push("/experience");

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this experience entry?")) {
      await deleteMutation.mutateAsync();
    }
  };

  const handleSubmit = async (data: ExperienceFormValues): Promise<void> => {
    await updateMutation.mutateAsync(data);
  };

  const handleSuccess = (data: ExperienceFormValues) => {
    console.log("Experience updated successfully:", data);
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
          <p>Please sign in to view experience details.</p>
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
  if (isError || !experience) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to load experience entry";

    return <ErrorState message={errorMessage} onRetry={() => refetch()} />;
  }

  // Convert experience data to form values
  const experienceFormValues: Partial<ExperienceFormValues> = {
    company: experience.company,
    role: experience.role,
    date: experience.date,
    desc: experience.desc,
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
          Back to Experience
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
        <ExperienceView
          experience={experience}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isMainDeleting={deleteMutation.isPending}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Edit Experience</h1>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>

          <ExperienceForm
            mode="edit"
            experienceId={experienceId}
            initialValues={experienceFormValues}
            existingImageUrl={experience.img}
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
