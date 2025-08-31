"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProjectForm from "@/components/forms/project-form";
import { ProjectFormValues } from "@/components/forms/form-schemas/project-schema";

// Helper function to convert form data to FormData
const toFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      // Skip undefined/null values except for image which should be validated earlier
      return;
    }

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

    // FileList handling
    if (value instanceof FileList && value.length > 0) {
      for (let i = 0; i < value.length; i++) {
        formData.append(key, value[i]);
      }
      return;
    }

    // Other primitives
    formData.append(key, String(value));
  });

  return formData;
};

// API function
const createProject = async (data: FormData) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/project`, {
    method: "POST",
    body: data,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to create project: ${response.statusText}`;

    // Parse common error messages
    if (errorText.includes("violates not-null constraint")) {
      if (errorText.includes("image")) {
        errorMessage = "Project image is required and cannot be empty";
      } else {
        errorMessage = "Required field is missing";
      }
    } else if (errorText.includes("validation")) {
      errorMessage = "Please check your input and try again";
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

export default function CreateProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  const userId = session?.user?.id;

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      console.log("Project created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      alert("Project created successfully!");
      router.push("/project");
    },
    onError: (error: Error) => {
      console.error("Failed to create project:", error);
      alert(error.message || "Failed to create project");
    },
  });

  // Handle form submission
  const handleSubmit = async (data: ProjectFormValues): Promise<void> => {
    console.log("Form data before validation:", data);
    console.log(
      "Image data:",
      data.image,
      "Type:",
      typeof data.image,
      "Length:",
      data.image?.length
    );

    // Validate that image is present for create mode
    // data.image should be an array-like structure or FileList
    const hasImage =
      data.image &&
      ((Array.isArray(data.image) && data.image.length > 0) ||
        (data.image.length && data.image.length > 0));

    if (!hasImage || !data.image) {
      throw new Error("Project image is required - please upload an image");
    }

    // Additional validation to ensure it's a valid file
    const firstFile = Array.isArray(data.image) ? data.image[0] : data.image[0];
    if (!firstFile || !(firstFile instanceof File)) {
      throw new Error("Invalid image file - please upload a valid image");
    }

    const formData = toFormData(data);

    // Log what's being sent to the API
    console.log("FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    await createProjectMutation.mutateAsync(formData);
  };

  const handleSuccess = (data: ProjectFormValues) => {
    console.log("Project form submitted successfully:", data);
  };

  const handleError = (error: Error) => {
    console.error("Project form error:", error);
  };

  // Authentication check
  if (status === "loading") {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || !userId) {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <p>Please sign in to create a project.</p>
            <Button onClick={() => router.push("/login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ProjectForm
        mode="create"
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onError={handleError}
        isLoading={createProjectMutation.isPending}
      />
    </div>
  );
}
