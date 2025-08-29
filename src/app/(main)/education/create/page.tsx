"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import EducationForm from "@/components/forms/education-form";
import { EducationFormValues } from "@/components/forms/form-schemas/education-schema";

export default function CreateEducationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createEducationMutation = useMutation({
    mutationFn: async (data: EducationFormValues) => {
      const formData = new FormData();

      // Append form fields to FormData
      formData.append("school", data.school);
      formData.append("degree", data.degree);
      formData.append("date", data.date);
      formData.append("grade", data.grade);
      formData.append("desc", data.desc);

      // Append image if provided
      if (data.img && data.img.length > 0) {
        formData.append("img", data.img[0]);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/education`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create education entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      alert("Education entry has been created successfully.");
      router.push("/education");
    },
    onError: (error) => {
      alert(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSuccess = (data: EducationFormValues) => {
    console.log("Education created successfully:", data);
  };

  const handleError = (error: Error) => {
    console.error("Error creating education:", error);
  };

  return (
    <div className="container mx-auto py-6">
      <EducationForm
        mode="create"
        onSubmit={createEducationMutation.mutateAsync}
        onSuccess={handleSuccess}
        onError={handleError}
        isLoading={createEducationMutation.isPending}
      />
    </div>
  );
}
