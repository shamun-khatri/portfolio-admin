"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bioCreateSchema,
  type BioFormData,
  type Bio,
} from "../forms/form-schemas/bio-schema";
import { useBio, useCreateBio, useUpdateBio } from "@/hooks/use-bio";
import { BioForm } from "../forms/bio-form";
import { Card, CardContent } from "@/components/ui/card";
import { BioDisplay } from "./bio-display";

interface BioFormWrapperProps {
  onSuccess?: (bio: Bio) => void;
  onError?: (error: string) => void;
}

export function BioFormWrapper({ onSuccess, onError }: BioFormWrapperProps) {
  const { data, isLoading, error } = useBio();
  const createBio = useCreateBio();
  const updateBio = useUpdateBio();
  const [isEditing, setIsEditing] = useState(false);

  const existingBio = data && Object.keys(data).length > 0 ? data : null;
  const isUpdateMode = !!existingBio;

  const form = useForm<BioFormData>({
    resolver: zodResolver(bioCreateSchema),
    defaultValues: {
      name: "",
      designations: [""],
      desc: "",
      profileImage: undefined, // Changed from "" to undefined for file field
      resumeUrl: "",
    },
  });

  // Load existing bio data when available
  useEffect(() => {
    if (!isLoading && existingBio) {
      form.reset({
        name: existingBio?.name || "",
        designations: existingBio?.designations || [""],
        desc: existingBio?.desc || "",
        profileImage: undefined, // Reset to undefined for edit mode
        resumeUrl: existingBio?.resumeUrl || "",
      });
    }
  }, [isLoading, existingBio, form, data]);

  const handleSubmit = async (data: BioFormData) => {
    try {
      let result: Bio | null;

      // Log what's being sent
      console.log("Bio form data:", data);

      if (isUpdateMode) {
        result = await updateBio.mutateAsync(data);
        setIsEditing(false);
      } else {
        // Validate that image is present for create mode
        if (!data.profileImage || !data.profileImage.length) {
          throw new Error("Profile image is required for new bio creation");
        }
        result = await createBio.mutateAsync(data);
      }

      if (result) {
        onSuccess?.(result);
      }
    } catch (error) {
      const errorMessage = isUpdateMode
        ? "Failed to update bio"
        : "Failed to create bio";
      onError?.(errorMessage);
      console.error(errorMessage, error);
    }
  };
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (existingBio) {
      form.reset({
        name: existingBio.name,
        designations: existingBio.designations,
        desc: existingBio.desc,
        profileImage: undefined, // Reset to undefined for cancel
        resumeUrl: existingBio.resumeUrl || "",
      });
    }
  };

  const isSubmitting = createBio.isPending || updateBio.isPending;

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <p className="text-destructive">Error loading bio data</p>
        </CardContent>
      </Card>
    );
  }

  // Show display mode if bio exists and not editing
  if (existingBio && !isEditing) {
    return <BioDisplay bio={existingBio} onEdit={handleEdit} />;
  }

  // Show form mode for creation or editing
  return (
    <BioForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={isUpdateMode ? handleCancel : undefined}
      isSubmitting={isSubmitting}
      mode={isUpdateMode ? "edit" : "create"}
      existingImageUrl={existingBio?.profileImage}
    />
  );
}
