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
import MetadataBuilder from "@/components/global/metadata-builder";

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
      metadataJson: "",
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
      metadataJson: initialValues.metadataJson || "",
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
    <Card className="max-w-4xl mx-auto relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[32px]">
      {/* Decorative Gradient elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -z-10 rounded-full" />

      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <FolderOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight uppercase">
              {mode === "create" ? "Create New Project" : "Edit Project"}
            </CardTitle>
            <CardDescription className="text-base font-medium text-muted-foreground/80">
              {mode === "create"
                ? "Add a new project to your portfolio. Fill in the details below to showcase your work."
                : "Update your project details. Modify any field you want to change."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Existing Image Preview (Edit Mode) */}
            {mode === "edit" && existingImageUrl && (
              <div className="space-y-4 p-6 rounded-3xl bg-muted/20 border border-border/10">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  Active Project Asset
                </div>
                <div className="relative rounded-2xl overflow-hidden ring-4 ring-background shadow-xl">
                  <Image
                    src={existingImageUrl}
                    alt="Current project"
                    width={800}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Project Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                        Project Vision
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            placeholder="e.g. Quantum Analytics Suite"
                            {...field}
                            className="bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-2xl h-14 pl-12 font-bold transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">
                        Launch Timeline
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-purple-500 transition-colors" />
                          <Input
                            placeholder="e.g. Q4 2023 or March 2024"
                            {...field}
                            className="bg-background/40 border-border/40 focus:border-purple-500/50 focus:ring-purple-500/10 rounded-2xl h-14 pl-12 font-bold transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/80">
                        Strategic Category
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
                          <Input
                            placeholder="e.g. Enterprise Cloud Architecture"
                            {...field}
                            className="bg-background/40 border-border/40 focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-2xl h-14 pl-12 font-bold transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                {/* Project Image */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { onChange } }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500/80 flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Visual Branding
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
              </div>
            </div>

            <Separator className="bg-border/10" />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                    <FileText className="h-4 w-4" />
                    Project Narrative
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Deep dive into the project's purpose, the problems it solves, and its technical complexity..."
                      className="min-h-[160px] bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-3xl p-6 font-medium leading-relaxed resize-none text-base"
                      {...field}
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
                <FormItem className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500/80">
                    Custom Metadata
                  </div>
                  <FormControl>
                    <MetadataBuilder value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">
                    <Tag className="h-4 w-4" />
                    Technology Stack
                  </div>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="e.g. Next.js 15, Rust, AWS Lambda"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleTagInputKeyPress}
                          className="bg-background/40 border-border/40 focus:border-purple-500/50 focus:ring-purple-500/10 rounded-2xl h-12 px-6 font-bold flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          disabled={
                            !tagInput.trim() ||
                            (field.value && field.value.length >= 10)
                          }
                          className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl h-12 px-6 shadow-lg shadow-purple-500/20"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>

                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-6 bg-muted/20 border border-border/5 rounded-[24px]">
                          {field.value.map((tag, index) => (
                            <Badge
                              key={`${tag}-${index}`}
                              className="group bg-background/60 hover:bg-background border-border/40 hover:border-purple-500/50 text-foreground px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-default"
                            >
                              <span className="font-bold text-xs uppercase tracking-wider">{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
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

            <Separator className="bg-border/10" />

            {/* Links Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500/80 flex items-center gap-2">
                <Link className="h-4 w-4 text-blue-500" />
                Connection & Deployment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GitHub URL */}
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold text-muted-foreground/70">Source Repository</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
                          <Input
                            placeholder="https://github.com/profile/repo"
                            className="bg-background/40 border-border/40 focus:border-foreground/50 focus:ring-foreground/10 rounded-2xl h-12 pl-12 font-medium"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project URL */}
                <FormField
                  control={form.control}
                  name="projectUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold text-muted-foreground/70">Live Deployment</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            placeholder="https://project-demo.com"
                            className="bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-2xl h-12 pl-12 font-medium"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 rounded-2xl h-16 px-16 font-black uppercase tracking-[0.2em] text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <Save className="mr-3 h-5 w-5" />
                    {mode === "create" ? "Initialize Project" : "Finalize Changes"}
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
