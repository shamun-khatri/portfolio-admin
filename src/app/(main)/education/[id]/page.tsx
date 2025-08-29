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
  GraduationCap,
  Building,
  Calendar,
  Trophy,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import EducationForm from "@/components/forms/education-form";
import { EducationFormValues } from "@/components/forms/form-schemas/education-schema";

// Types
interface Education {
  _id: string;
  img: string;
  school: string;
  degree: string;
  date: string;
  grade: string;
  desc: string;
}

// API Functions
const fetchEducation = async (
  userId: string,
  id: string
): Promise<Education> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/education/${userId}/${id}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch education entry: ${response.statusText}`);
  }

  return response.json();
};

const updateEducation = async (
  id: string,
  data: EducationFormValues
): Promise<{ success?: boolean; message?: string }> => {
  const formData = new FormData();

  formData.append("school", data.school);
  formData.append("degree", data.degree);
  formData.append("date", data.date);
  formData.append("grade", data.grade);
  formData.append("desc", data.desc);

  if (data.img && data.img.length > 0) {
    formData.append("img", data.img[0]);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/education/${id}`,
    {
      method: "PUT",
      credentials: "include",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update education entry: ${response.statusText}`);
  }

  return response.json();
};

// Loading Component
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading education details...</p>
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
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold">Unable to Load Education</h3>
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
function EducationView({
  education,
  onEdit,
}: {
  education: Education;
  onEdit: () => void;
}) {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">{education.school}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-sm">
              {education.degree}
            </Badge>
          </div>
          <Button
            onClick={onEdit}
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Institution Image */}
        {education.img && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Institution Logo
            </div>
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={education.img}
                alt={`${education.school} logo`}
                width={800}
                height={200}
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Education Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building className="h-4 w-4" />
              Institution
            </div>
            <p className="text-lg font-medium">{education.school}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              Degree/Program
            </div>
            <p className="text-lg font-medium">{education.degree}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Duration
            </div>
            <p className="text-lg font-medium">{education.date}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Grade/GPA
            </div>
            <p className="text-lg font-medium">{education.grade}</p>
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
              {education.desc}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function EducationDetailPage() {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  const userId = session?.user?.id as string | undefined;
  const educationId = params?.id as string;

  // Fetch education data
  const {
    data: education,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["education", userId, educationId],
    queryFn: () => fetchEducation(userId!, educationId),
    enabled: !!userId && !!educationId,
    retry: 2,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: EducationFormValues) =>
      updateEducation(educationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      setMode("view");
      alert("Education entry updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Update failed:", error);
      alert(error.message || "Failed to update education entry");
    },
  });

  // Event Handlers
  const handleEdit = () => setMode("edit");
  const handleCancelEdit = () => setMode("view");
  const handleBack = () => router.push("/education");

  // Custom submit handler that wraps the mutation
  const handleSubmit = async (data: EducationFormValues): Promise<void> => {
    await updateMutation.mutateAsync(data);
  };

  const handleSuccess = (data: EducationFormValues) => {
    console.log("Education updated successfully:", data);
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
          <p>Please sign in to view education details.</p>
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
  if (isError || !education) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load education entry";

    return <ErrorState message={errorMessage} onRetry={() => refetch()} />;
  }

  // Convert education data to form values
  const educationFormValues: Partial<EducationFormValues> = {
    school: education.school,
    degree: education.degree,
    date: education.date,
    grade: education.grade,
    desc: education.desc,
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
          Back to Education
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
        <EducationView education={education} onEdit={handleEdit} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Edit Education</h1>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>

          <EducationForm
            mode="edit"
            educationId={educationId}
            initialValues={educationFormValues}
            existingImageUrl={education.img}
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
