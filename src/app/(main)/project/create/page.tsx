"use client";

import type React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useState } from "react";
import {
  Plus,
  X,
  Github,
  ExternalLink,
  ImageIcon,
  Loader2,
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

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  date: z.string().optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  image: z.string().url("Please enter a valid image URL"),
  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),
  category: z.string().min(1, "Category is required"),
  github: z
    .string()
    .url("Please enter a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  projectUrl: z
    .string()
    .url("Please enter a valid project URL")
    .optional()
    .or(z.literal("")),
});

type ProjectFormData = z.infer<typeof formSchema>;

const createProject = async (data: FormData) => {
  console.log("Submitting project data:", data);
  // check content type of data
  console.log("Is ProjectFormData:", data instanceof FormData); // This will return false
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/project`, {
    method: "POST",
    body: data, // Pass the ProjectFormData object directly
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json(); // Return the JSON response
};

export default function CreateProjectForm() {
  const [tagInput, setTagInput] = useState("");

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      tags: [],
      category: "",
      github: "",
      projectUrl: "",
      date: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      console.log("Project created successfully:", data);
      form.reset();
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
    },
  });

  const toFormData = (
    data: Record<string, string | string[] | File | undefined>
  ): FormData => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle arrays (e.g., tags)
        formData.append(key, JSON.stringify(value));
      } else if (value instanceof File) {
        // Handle file uploads
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        // Handle other fields
        formData.append(key, value);
      }
    });

    return formData;
  };

  const onSubmit = (data: ProjectFormData) => {
    const formData = toFormData(data);
    createProjectMutation.mutate(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !form.getValues("tags").includes(tagInput.trim())) {
      const currentTags = form.getValues("tags");
      if (currentTags.length < 10) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
        setTagInput("");
      } else {
        console.warn("Maximum 10 tags allowed");
      }
    }
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
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create New Project
          </CardTitle>
          <CardDescription>
            Add a new project to your portfolio. Fill in the details below to
            showcase your work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your project a catchy and descriptive title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Date</FormLabel>
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

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project, its features, technologies used, and what makes it special..."
                        className="min-h-[120px]"
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

              {/* Image URL */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Image</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://example.com/project-image.jpg"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      URL to a screenshot or preview image of your project.
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Web Development, Mobile App, Machine Learning"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What type of project is this?
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
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag (e.g., React, TypeScript, API)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagInputKeyPress}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addTag}
                            disabled={
                              !tagInput.trim() || field.value.length >= 10
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Add relevant tags to help categorize your project (1-10
                      tags).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* GitHub URL */}
              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repository</FormLabel>
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
                    <FormLabel>Live Project URL</FormLabel>
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

              <Button
                type="submit"
                className="w-full"
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
