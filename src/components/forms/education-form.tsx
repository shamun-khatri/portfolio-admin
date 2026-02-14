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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  GraduationCap,
  Calendar,
  Award,
  School,
  FileText,
  Save,
  Plus,
  ImageIcon,
} from "lucide-react";
import {
  EducationFormValues,
  educationSchema,
} from "@/components/forms/form-schemas/education-schema";
import ImageUpload from "@/components/global/image-upload";
import MetadataBuilder from "@/components/global/metadata-builder";
import { appendMetadataToFormData, parseMetadataJson } from "@/lib/metadata-formdata";

export interface EducationFormProps {
  /**
   * Mode of the form - determines behavior and UI
   * - create: For adding new education entry
   * - edit: For updating existing education entry
   * - view: For viewing education entry (read-only)
   */
  mode?: "create" | "edit" | "view";

  /**
   * Initial values for the form (used in edit/view modes)
   */
  initialValues?: Partial<EducationFormValues>;

  /**
   * ID of the education entry (used in edit mode)
   */
  educationId?: string;

  /**
   * Callback fired when form is successfully submitted
   */
  onSuccess?: (data: EducationFormValues) => void;

  /**
   * Callback fired when form submission fails
   */
  onError?: (error: Error) => void;

  /**
   * Custom submit handler - if provided, default API call is bypassed
   */
  onSubmit?: (data: EducationFormValues) => Promise<void>;

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
   * URL of existing image (for edit/view modes)
   */
  existingImageUrl?: string;

  /**
   * Show/hide the reset button
   */
  showResetButton?: boolean;

  /**
   * Loading state (external)
   */
  isLoading?: boolean;
}

const defaultFormValues: EducationFormValues = {
  img: undefined,
  school: "",
  date: "",
  grade: "",
  desc: "",
  degree: "",
  metadataJson: "",
};

export default function EducationForm({
  mode = "create",
  initialValues,
  educationId,
  onSuccess,
  onError,
  onSubmit: customOnSubmit,
  showCard = true,
  title,
  description,
  className,
  showResetButton = true,
  isLoading: externalLoading = false,
  existingImageUrl,
}: EducationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Determine form title and description based on mode
  const getTitle = () => {
    if (title) return title;
    switch (mode) {
      case "create":
        return "Add Education";
      case "edit":
        return "Edit Education";
      case "view":
        return "Education Details";
      default:
        return "Education";
    }
  };

  const getDescription = () => {
    if (description) return description;
    switch (mode) {
      case "create":
        return "Add your educational background and achievements";
      case "edit":
        return "Update your educational information";
      case "view":
        return "View educational background and achievements";
      default:
        return "";
    }
  };

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      ...defaultFormValues,
      ...initialValues,
    },
  });

  const defaultApiSubmit = async (data: EducationFormValues) => {
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

    appendMetadataToFormData(formData, parseMetadataJson(data.metadataJson));

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_URL}/education/${educationId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/education`;

    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        isEditMode
          ? "Failed to update education entry"
          : "Failed to create education entry"
      );
    }

    return response.json();
  };

  const handleSubmit = async (data: EducationFormValues) => {
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
    return isEditMode ? "Update Education" : "Add Education";
  };

  const isFormLoading = isSubmitting || externalLoading;

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                    Institution Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <School className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        placeholder="e.g. Stanford University"
                        {...field}
                        disabled={isReadOnly || isFormLoading}
                        className="bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-2xl h-14 pl-12 font-bold transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">
                    Degree / Qualification
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        placeholder="e.g. Bachelor of Computer Science"
                        {...field}
                        disabled={isReadOnly || isFormLoading}
                        className="bg-background/40 border-border/40 focus:border-purple-500/50 focus:ring-purple-500/10 rounded-2xl h-14 pl-12 font-bold transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/80">
                      Timeline
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                          placeholder="2018 - 2022"
                          {...field}
                          disabled={isReadOnly || isFormLoading}
                          className="bg-background/40 border-border/40 focus:border-slate-500/50 focus:ring-slate-500/10 rounded-2xl h-12 pl-10 font-medium text-sm transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/80">
                      GPA / Grade
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="3.9 / 4.0"
                        {...field}
                        disabled={isReadOnly || isFormLoading}
                        className="bg-background/40 border-border/40 focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-2xl h-12 font-black text-sm transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="img"
              render={({ field: { onChange } }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500/80 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Institution Branding
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition" />
                      <div className="relative">
                        <ImageUpload
                          onFileChange={(file) => {
                            if (file) {
                              const fileArray = [file];
                              onChange(fileArray as unknown as FileList);
                            } else {
                              onChange(undefined);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditMode && existingImageUrl && (
              <div className="p-4 rounded-3xl bg-muted/20 border border-border/10 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Asset</span>
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-background shadow-xl">
                  <Image
                    src={existingImageUrl}
                    alt="Current"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-border/10" />

        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                <FileText className="h-4 w-4" />
                Key Learnings & Activities
              </div>
              <FormControl>
                <Textarea
                  placeholder="Describe your major, relevant coursework, or extracurricular honors..."
                  className="min-h-[160px] bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-3xl p-6 font-medium leading-relaxed resize-none text-base"
                  {...field}
                  disabled={isReadOnly || isFormLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

            <FormField
              control={form.control}
              name="metadataJson"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/80">
                    Custom Metadata
                  </FormLabel>
                  <FormControl>
                    <MetadataBuilder value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

        {!isReadOnly && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
            {showResetButton && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                className="w-full sm:w-auto rounded-xl h-12 px-6 font-bold hover:bg-muted/30 transition-all"
                disabled={isFormLoading}
              >
                Reset Milestone
              </Button>
            )}
            <Button
              type="submit"
              disabled={isFormLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 rounded-2xl h-14 px-12 font-black uppercase tracking-widest text-xs"
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  {mode === "edit" ? (
                    <Save className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {getSubmitButtonText()}
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );

  if (!showCard) {
    return (
      <div className={className}>
        {formContent}
      </div>
    );
  }

  return (
    <Card className="w-full relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[32px]">
      {/* Decorative Gradient elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -z-10 rounded-full" />

      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight uppercase">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-base font-medium text-muted-foreground/80">
              {getDescription()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4">
        {formContent}
      </CardContent>

    </Card>
  );
}
