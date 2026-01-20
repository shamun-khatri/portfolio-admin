"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import ExperienceForm from "@/components/forms/experience-form";
import { ExperienceFormValues } from "@/components/forms/form-schemas/experience-schema";

export default function CreateExperiencePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createExperienceMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      const formData = new FormData();

      // Append form fields to FormData
      formData.append("company", data.company);
      formData.append("role", data.role);
      formData.append("date", data.date);
      formData.append("desc", data.desc);

      // Append image if provided
      if (data.img && data.img.length > 0) {
        formData.append("img", data.img[0]);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/experiences`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create experience entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      alert("Experience entry has been created successfully.");
      router.push("/experience");
    },
    onError: (error) => {
      alert(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSuccess = (data: ExperienceFormValues) => {
    console.log("Experience created successfully:", data);
  };

  const handleError = (error: Error) => {
    console.error("Error creating experience:", error);
  };

  const handleSubmit = async (data: ExperienceFormValues): Promise<void> => {
    await createExperienceMutation.mutateAsync(data);
  };

  return (
    <div className="container mx-auto py-6">
      <ExperienceForm
        mode="create"
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onError={handleError}
        isLoading={createExperienceMutation.isPending}
      />
    </div>
  );
}
