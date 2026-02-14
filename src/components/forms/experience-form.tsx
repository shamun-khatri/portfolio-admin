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
import { Badge } from "@/components/ui/badge";
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
  Tag,
  X,
} from "lucide-react";
import {
  ExperienceFormValues,
  experienceSchema,
} from "@/components/forms/form-schemas/experience-schema";
import ImageUpload from "@/components/global/image-upload";
import MetadataBuilder from "@/components/global/metadata-builder";
import { appendMetadataToFormData, parseMetadataJson } from "@/lib/metadata-formdata";
import { useCustomFieldSchema } from "@/hooks/use-custom-entities";

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
  skills: [],
  metadataJson: "",
};

export default function ExperienceForm({
  mode = "create",
  initialValues,
  experienceId,
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
  const [tagInput, setTagInput] = useState("");
  const { fieldSchema } = useCustomFieldSchema("experience");

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

    // Append skills if provided
    if (data.skills && data.skills.length > 0) {
      data.skills.forEach((skill) => {
        formData.append("skills[]", skill);
      });
    }

    // Append image if provided
    if (data.img && data.img.length > 0) {
      formData.append("img", data.img[0]);
    }

    appendMetadataToFormData(formData, parseMetadataJson(data.metadataJson));

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_URL}/experiences/${experienceId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/experiences`;

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

  // Skill/Tag management
  const addSkill = () => {
    const trimmedSkill = tagInput.trim();
    const currentSkills = form.getValues("skills") || [];

    if (
      !trimmedSkill ||
      currentSkills.includes(trimmedSkill)
    ) {
      return;
    }

    form.setValue("skills", [...currentSkills, trimmedSkill]);
    setTagInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return isEditMode ? "Updating..." : "Creating...";
    }
    return isEditMode ? "Update Experience" : "Add Experience";
  };

  const isFormLoading = isSubmitting || externalLoading;

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                    Organization
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        placeholder="e.g. Google, Inc."
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
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">
                    Professional Role
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        placeholder="e.g. Senior Software Engineer"
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/80">
                    Engagement Period
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        placeholder="e.g. Jan 2022 - Present"
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
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="img"
              render={({ field: { onChange } }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500/80 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Corporate Branding
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
                Impact & Contributions
              </div>
              <FormControl>
                <Textarea
                  placeholder="Describe your primary responsibilities and high-impact achievements..."
                  className="min-h-[200px] bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-3xl p-6 font-medium leading-relaxed resize-none text-base"
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
                    <MetadataBuilder
                      value={field.value}
                      onChange={field.onChange}
                      fieldDefinitions={fieldSchema}
                      readOnly={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">
                <Tag className="h-4 w-4" />
                Key Technologies & Skills
              </div>
              <FormControl>
                <div className="space-y-4">
                  {!isReadOnly && (
                    <div className="flex gap-3">
                      <Input
                        placeholder="e.g. React, Node.js, AWS, Kubernetes..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleSkillInputKeyPress}
                        disabled={isFormLoading}
                        className="bg-background/40 border-border/40 focus:border-purple-500/50 focus:ring-purple-500/10 rounded-2xl h-12 px-6 font-bold flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addSkill}
                        disabled={!tagInput.trim() || isFormLoading}
                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl h-12 px-6 shadow-lg shadow-purple-500/20"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-6 bg-muted/20 border border-border/5 rounded-[24px]">
                      {field.value.map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          className="group bg-background/60 hover:bg-background border-border/40 hover:border-purple-500/50 text-foreground px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-default"
                        >
                          <span className="font-bold text-xs uppercase tracking-wider">{skill}</span>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              disabled={isFormLoading}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 disabled:cursor-not-allowed"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
                Reset Details
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
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Card className="w-full relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[32px]">
      {/* Decorative Gradient elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -z-10 rounded-full" />

      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <Briefcase className="h-7 w-7 text-white" />
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
