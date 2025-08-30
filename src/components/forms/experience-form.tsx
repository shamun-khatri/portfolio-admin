"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Briefcase,
  Calendar,
  Building,
  User,
  FileText,
  Save,
  Plus,
  ImageIcon,
} from "lucide-react";
import {
  ExperienceFormValues,
  experienceSchema,
} from "@/components/forms/form-schemas/experience-schema";
import ImageUpload from "@/components/global/image-upload";

export interface ExperienceFormProps {
  /**
   * Mode of the form - determines behavior and UI
   * - create: For adding new experience entry
   * - edit: For updating existing experience entry
   * - view: For viewing experience entry (read-only)
   */
  mode?: "create" | "edit" | "view";

  /**
   * Initial values for the form (used in edit/view modes)
   */
  initialValues?: Partial<ExperienceFormValues>;

  /**
   * ID of the experience entry (used in edit mode)
   */
  experienceId?: string;

  /**
   * User ID for API calls
   */
  userId?: string;

  /**
   * URL of existing image (for edit/view modes)
   */
  existingImageUrl?: string;

  /**
   * Callback fired when form is successfully submitted
   */
  onSuccess?: (data: ExperienceFormValues) => void;

  /**
   * Callback fired when form submission fails
   */
  onError?: (error: Error) => void;

  /**
   * Custom submit handler - if provided, default API call is bypassed
   */
  onSubmit?: (data: ExperienceFormValues) => Promise<void>;

  /**
   * Show/hide the card wrapper
   */
  showCard?: boolean;

  /**
   * Custom card title
   */
  title?: string;

  /**
   * Custom card description
   */
  description?: string;

  /**
   * Additional CSS classes for the wrapper
   */
  className?: string;

  /**
   * Show/hide the reset button
   */
  showResetButton?: boolean;

  /**
   * Loading state (external)
   */
  isLoading?: boolean;
}

const defaultFormValues: ExperienceFormValues = {
  img: undefined,
  company: "",
  role: "",
  date: "",
  desc: "",
};

export default function ExperienceForm({
  mode = "create",
  initialValues,
  experienceId,
  userId,
  existingImageUrl,
  onSuccess,
  onError,
  onSubmit: customOnSubmit,
  showCard = true,
  title,
  description,
  className,
  showResetButton = true,
  isLoading: externalLoading = false,
}: ExperienceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Determine form title and description based on mode
  const getTitle = () => {
    if (title) return title;
    switch (mode) {
      case "create":
        return "Add Experience";
      case "edit":
        return "Edit Experience";
      case "view":
        return "Experience Details";
      default:
        return "Experience";
    }
  };

  const getDescription = () => {
    if (description) return description;
    switch (mode) {
      case "create":
        return "Add your professional experience and achievements";
      case "edit":
        return "Update your professional experience information";
      case "view":
        return "View professional experience and achievements";
      default:
        return "";
    }
  };

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      ...defaultFormValues,
      ...initialValues,
    },
  });

  const defaultApiSubmit = async (data: ExperienceFormValues) => {
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

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_URL}/experience/${experienceId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/experience`;

    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        isEditMode
          ? "Failed to update experience entry"
          : "Failed to create experience entry"
      );
    }

    return response.json();
  };

  const handleSubmit = async (data: ExperienceFormValues) => {
    if (isReadOnly) return;

    setIsSubmitting(true);

    try {
      if (customOnSubmit) {
        await customOnSubmit(data);
      } else {
        await defaultApiSubmit(data);
      }

      onSuccess?.(data);

      if (isCreateMode) {
        form.reset();
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error("An unknown error occurred");
      onError?.(errorObj);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isReadOnly) return;
    form.reset(
      isEditMode
        ? { ...defaultFormValues, ...initialValues }
        : defaultFormValues
    );
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return isEditMode ? "Updating..." : "Creating...";
    }
    return isEditMode ? "Update Experience" : "Add Experience";
  };

  const getSubmitButtonIcon = () => {
    if (isSubmitting) {
      return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    }
    return isEditMode ? (
      <Save className="mr-2 h-4 w-4" />
    ) : (
      <Plus className="mr-2 h-4 w-4" />
    );
  };

  const isFormLoading = isSubmitting || externalLoading;

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Google, Microsoft"
                    {...field}
                    disabled={isReadOnly || isFormLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Role/Position
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    {...field}
                    disabled={isReadOnly || isFormLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Duration/Period
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Jan 2022 - Present or 2020-2023"
                  {...field}
                  disabled={isReadOnly || isFormLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </FormControl>
              <FormDescription>
                Enter the employment period or duration
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="img"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Company Logo/Image
              </FormLabel>

              {/* Existing Image Preview */}
              {existingImageUrl && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Current Image:
                  </div>
                  <div className="relative rounded-lg overflow-hidden bg-muted border">
                    <Image
                      src={existingImageUrl}
                      alt="Current company logo"
                      width={400}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
                        Current
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <FormControl>
                <div
                  className={
                    isReadOnly || isFormLoading
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                >
                  <div className="space-y-2">
                    {existingImageUrl && (
                      <div className="text-sm text-muted-foreground">
                        {isEditMode
                          ? "Upload a new image to replace the current one:"
                          : "Upload an image:"}
                      </div>
                    )}
                    <ImageUpload
                      onFileChange={(file) => {
                        onChange(file ? [file] : undefined);
                      }}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your role, responsibilities, achievements, and key contributions..."
                  className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  {...field}
                  disabled={isReadOnly || isFormLoading}
                />
              </FormControl>
              <FormDescription>
                Share details about your responsibilities, achievements, and
                impact
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isReadOnly && (
          <div className="flex gap-4 pt-4">
            {showResetButton && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1"
                disabled={isFormLoading}
              >
                Reset Form
              </Button>
            )}
            <Button
              type="submit"
              className={showResetButton ? "flex-1" : "w-full"}
              disabled={isFormLoading}
            >
              {getSubmitButtonIcon()}
              {getSubmitButtonText()}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );

  if (!showCard) {
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className || ""}`}>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
        </div>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
