"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  Plus,
  X,
  Github,
  ExternalLink,
  ImageIcon,
  Loader2,
  Save,
  Upload,
  Calendar,
  Tag,
  FolderOpen,
  FileText,
  Link,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/global/image-upload";

import {
  projectCreateSchema,
  projectUpdateSchema,
  type ProjectFormValues,
} from "./form-schemas/project-schema";

// Types
interface ProjectFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<ProjectFormValues>;
  existingImageUrl?: string;
  onSubmit: (data: ProjectFormValues) => Promise<void>;
  onSuccess?: (data: ProjectFormValues) => void;
  onError?: (error: Error) => void;
  isLoading?: boolean;
}

export default function ProjectForm({
  mode,
  initialValues = {},
  existingImageUrl,
  onSubmit,
  onSuccess,
  onError,
  isLoading = false,
}: ProjectFormProps) {
  const [tagInput, setTagInput] = useState("");

  const schema = mode === "create" ? projectCreateSchema : projectUpdateSchema;
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      image: undefined,
      tags: [],
      category: "",
      github: "",
      projectUrl: "",
      date: "",
    },
    values: {
      title: initialValues.title || "",
      description: initialValues.description || "",
      image: undefined,
      tags: Array.isArray(initialValues.tags) ? initialValues.tags : [],
      category: initialValues.category || "",
      github: initialValues.github || "",
      projectUrl: initialValues.projectUrl || "",
      date: initialValues.date || "",
    },
  });

  // Handle form submission
  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      await onSubmit(data);
      onSuccess?.(data);
    } catch (error) {
      console.error("Form submission error:", error);
      onError?.(
        error instanceof Error ? error : new Error("Submission failed")
      );
    }
  };

  // Tag management
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    const currentTags = form.getValues("tags");

    if (
      !trimmedTag ||
      currentTags.includes(trimmedTag) ||
      currentTags.length >= 10
    ) {
      return;
    }

    form.setValue("tags", [...currentTags, trimmedTag]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary" />
          {mode === "create" ? "Create New Project" : "Edit Project"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new project to your portfolio. Fill in the details below to showcase your work."
            : "Update your project details. Modify any field you want to change."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Existing Image Preview (Edit Mode) */}
            {mode === "edit" && existingImageUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  Current Project Image
                </div>
                <div className="relative rounded-lg overflow-hidden bg-muted border">
                  <Image
                    src={existingImageUrl}
                    alt="Current project"
                    width={800}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">
                      Current Image
                    </p>
                  </div>
                </div>
                <Separator />
              </div>
            )}

            {/* Project Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Project Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Awesome Project"
                      {...field}
                      className="text-lg"
                    />
                  </FormControl>
                  <FormDescription>
                    Give your project a catchy and descriptive title (1-100
                    characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Project Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., March 2024, Q1 2024, or 2024-03-15"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    When was this project completed? (Optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Image */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Project Image{" "}
                    {mode === "edit" ? "(Upload new to replace)" : "*Required"}
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      onFileChange={(file) => {
                        console.log(
                          "ImageUpload onFileChange called with:",
                          file
                        );
                        if (file) {
                          // Create an array to handle the file
                          const fileArray = [file];
                          onChange(fileArray as unknown as FileList);
                        } else {
                          onChange(undefined);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {mode === "create"
                      ? "Upload an image for your project (PNG, JPG, WEBP up to 5MB). Required."
                      : "Upload an image for your project (PNG, JPG, WEBP up to 5MB). Leave empty to keep current image."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Category
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Web Development, Mobile App, Machine Learning"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What type of project is this? (Required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project, its features, technologies used, and what makes it special..."
                      className="min-h-[140px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of your project (10-1000
                    characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag (e.g., React, TypeScript, API)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleTagInputKeyPress}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addTag}
                          disabled={
                            !tagInput.trim() ||
                            (field.value && field.value.length >= 10)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                          {field.value.map((tag, index) => (
                            <Badge
                              key={`${tag}-${index}`}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-muted-foreground hover:text-foreground ml-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Add relevant tags to help categorize your project (1-10 tags
                    required).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Links Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Link className="h-5 w-5" />
                Project Links
              </h3>

              {/* GitHub URL */}
              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub Repository
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://github.com/username/repository"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Link to your GitHub repository (Optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project URL */}
              <FormField
                control={form.control}
                name="projectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Live Project URL
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://myproject.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Link to the live version of your project (Optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {mode === "create"
                      ? "Creating Project..."
                      : "Saving Changes..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    {mode === "create" ? "Create Project" : "Save Changes"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
