"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateSkill } from "@/hooks/use-skills";
import SkillForm from "@/components/forms/skill-form";
import {
  skillCreateSchema,
  type SkillFormData,
} from "@/components/forms/form-schemas/skill-schema";

export default function CreateSkillPage() {
  const router = useRouter();
  const createSkillMutation = useCreateSkill();

  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillCreateSchema),
    defaultValues: {
      name: "",
      category: "",
      icon: undefined,
      metadataJson: "",
    },
  });

  // Handle form submission
  const handleSubmit = async (data: SkillFormData): Promise<void> => {
    console.log("Form data before validation:", data);
    console.log(
      "Icon data:",
      data.icon,
      "Type:",
      typeof data.icon,
      "Length:",
      data.icon?.length
    );

    // Validate that icon is present for create mode
    const hasIcon =
      data.icon &&
      ((Array.isArray(data.icon) && data.icon.length > 0) ||
        (data.icon.length && data.icon.length > 0));

    if (!hasIcon || !data.icon) {
      throw new Error("Skill icon is required - please upload an icon");
    }

    // Additional validation to ensure it's a valid file
    const firstFile = Array.isArray(data.icon) ? data.icon[0] : data.icon[0];
    if (!firstFile || !(firstFile instanceof File)) {
      throw new Error("Invalid icon file - please upload a valid icon");
    }

    await createSkillMutation.mutateAsync(data);
  };

  const handleSuccess = () => {
    router.push("/skills");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Skill</h1>
          <p className="text-muted-foreground">
            Add a new skill to your portfolio
          </p>
        </div>
      </div>

      {/* Form */}
      <SkillForm
        form={form}
        onSubmit={async (data) => {
          try {
            await handleSubmit(data);
            handleSuccess();
          } catch (error) {
            console.error("Failed to create skill:", error);
            // Error is already shown by the form mutation
          }
        }}
        onCancel={handleCancel}
        isSubmitting={createSkillMutation.isPending}
        mode="create"
      />
    </div>
  );
}
