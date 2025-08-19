"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/global/image-upload";
import {
  Plus,
  X,
  Github,
  ExternalLink,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { useParams } from "next/navigation";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5_000_000;

const formSchema = z.object({
  title: z.string().min(1).max(100),
  date: z.string().optional().or(z.literal("")),
  description: z.string().min(10).max(1000),
  image: z.any().optional(), // optional on edit; validation when present
  tags: z.array(z.string()).min(0).max(10),
  category: z.string().min(1),
  github: z.string().url().optional().or(z.literal("")),
  projectUrl: z.string().url().optional().or(z.literal("")),
});

type ProjectFormData = z.infer<typeof formSchema>;

interface Project extends Omit<ProjectFormData, "image"> {
  id: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Page() {
  const params = useParams();
  console.log("ProjectDetailsPage params:", params?.["id"]);
  const projectId = params["id"];
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | undefined>();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
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
  });

  // Fetch project
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/project/id/${projectId}`,
          { credentials: "include", cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load project");
        const data = await res.json();
        const p: Project = data?.data || data;
        if (active) {
          setProject(p);
          setPreviewImage(p.image);
          form.reset({
            title: p.title || "",
            description: p.description || "",
            tags: p.tags || [],
            category: p.category || "",
            github: p.github || "",
            projectUrl: p.projectUrl || "",
            date: p.date || "",
            image: undefined, // not pre-populating with URL
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [projectId, form]);

  // const toFormData = (data: Record<string, any>): FormData => {
  //   const fd = new FormData();
  //   Object.entries(data).forEach(([k, v]) => {
  //     if (v === undefined || v === null || v === "") return;
  //     if (Array.isArray(v)) {
  //       if (v.length && v.every((x) => x instanceof File)) {
  //         v.forEach((file) => fd.append(k, file));
  //       } else {
  //         v.forEach((val) => fd.append(`${k}[]`, String(val)));
  //       }
  //     } else if (v instanceof File) {
  //       fd.append(k, v);
  //     } else {
  //       fd.append(k, String(v));
  //     }
  //   });
  //   return fd;
  // };

  const toFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Handle array values
      if (Array.isArray(value)) {
        // Array of Files (e.g. [File])
        if (value.length && value.every((v) => v instanceof File)) {
          value.forEach((file) => formData.append(key, file));
        } else {
          // Primitive/string arrays (e.g. tags)
          value.forEach((v) => formData.append(`${key}[]`, String(v)));
        }
        return;
      }

      // Single File
      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      // Other primitives
      formData.append(key, String(value));
    });

    return formData;
  };

  const handleSave = async (values: ProjectFormData) => {
    try {
      setSaving(true);
      // Validate image if newly provided
      if (values.image?.length) {
        const file = values.image[0];
        if (file.size > MAX_FILE_SIZE) throw new Error("Image too large");
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
          throw new Error("Unsupported image type");
      }
      // Only send image if changed
      const payload: Record<string, any> = {
        title: values.title,
        description: values.description,
        category: values.category,
        tags: values.tags,
        github: values.github,
        projectUrl: values.projectUrl,
        date: values.date,
      };
      if (values.image?.length) {
        payload.image = values.image; // array of File(s)
      }
      const fd = toFormData(payload);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/project/${projectId}`,
        {
          method: "PUT",
          body: fd,
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to update project");
      const updated = await res.json();
      const updatedData: Project = updated?.data || updated;
      setProject(updatedData);
      if (updatedData.image) setPreviewImage(updatedData.image);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project?")) return;
    try {
      setDeleting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/project/${projectId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to delete");
      window.location.href = "/project";
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    const current = form.getValues("tags");
    if (!t || current.includes(t) || current.length >= 10) return;
    form.setValue("tags", [...current, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      form.getValues("tags").filter((t) => t !== tag)
    );
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fetching project details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
            <CardDescription>Project does not exist.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => (window.location.href = "/project")}>
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Edit Project</CardTitle>
          <CardDescription>
            View and update this project. Leave image empty to keep existing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Project title" {...field} />
                    </FormControl>
                    <FormDescription>Update the project title.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2024-06" {...field} />
                    </FormControl>
                    <FormDescription>Optional project date.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Image</label>
                {previewImage ? (
                  <div className="relative overflow-hidden rounded border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImage}
                      alt="Current"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded border text-muted-foreground text-sm">
                    No image
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel>Replace Image (optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        onFileChange={(file) => {
                          onChange(file ? [file] : undefined);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a new image (JPG, PNG, WEBP &lt; 5MB) to replace.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Web App" {...field} />
                    </FormControl>
                    <FormDescription>Project category.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px]"
                        placeholder="Describe the project..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>10–1000 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            placeholder="Add tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                              }
                            }}
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
                            {field.value.map((t) => (
                              <Badge
                                key={t}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {t}
                                <button
                                  type="button"
                                  onClick={() => removeTag(t)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>Up to 10 tags.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="https://github.com/user/repo"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Optional repository link.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Optional live link.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!project) return;
                    form.reset({
                      title: project.title || "",
                      description: project.description || "",
                      category: project.category || "",
                      tags: project.tags || [],
                      github: project.github || "",
                      projectUrl: project.projectUrl || "",
                      date: project.date || "",
                      image: undefined,
                    });
                    setTagInput("");
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        {project && (
          <CardFooter className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>ID: {project.id}</span>
            {project.createdAt && <span>Created: {project.createdAt}</span>}
            {project.updatedAt && <span>Updated: {project.updatedAt}</span>}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
