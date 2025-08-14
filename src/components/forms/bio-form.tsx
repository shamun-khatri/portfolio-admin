"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, User, FileText, ImageIcon } from "lucide-react";
import { bioSchema, type BioFormData } from "../forms/form-schemas/bio-schema";
import { useBio, useCreateBio, useUpdateBio } from "@/hooks/use-bio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function BioForm() {
  const { data, isLoading, error } = useBio();
  const createBio = useCreateBio();
  const updateBio = useUpdateBio();
  const [isEditing, setIsEditing] = useState(false);

  const existingBio = data;
  const isUpdateMode = !!existingBio;

  const form = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      name: "",
      designations: [""],
      desc: "",
      profileImage: "",
      resumeUrl: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "designations",
  });

  // Load existing bio data when available
  useEffect(() => {
    console.log("Fetched Bio Data:", data);
    if (!isLoading && existingBio) {
      console.log("Existing Bio Data:", existingBio);
      form.reset({
        name: existingBio?.name || "",
        designations: existingBio?.designations || [""],
        desc: existingBio?.desc || "",
        profileImage: existingBio?.profileImage || "",
        resumeUrl: existingBio?.resumeUrl || "",
      });
    }
  }, [isLoading, existingBio, form]);

  const onSubmit = async (data: BioFormData) => {
    try {
      if (isUpdateMode) {
        await updateBio.mutateAsync(data);
        alert("Bio updated successfully!");
        setIsEditing(false);
      } else {
        await createBio.mutateAsync(data);
        alert("Bio created successfully!");
      }
    } catch (error) {
      alert(isUpdateMode ? "Failed to update bio" : "Failed to create bio");
    }
  };

  const addDesignation = () => {
    append("");
  };

  const removeDesignation = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-destructive">Error loading bio data</p>
        </CardContent>
      </Card>
    );
  }

  // Display mode for existing bio
  if (existingBio && !isEditing) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Bio
              </CardTitle>
              <CardDescription>
                Your professional bio information
              </CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Bio
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg">{existingBio.name}</h3>
          </div>

          <div>
            <h4 className="font-medium mb-2">Designations</h4>
            <div className="flex flex-wrap gap-2">
              {existingBio.designations.map((designation, index) => (
                <Badge key={index} variant="secondary">
                  {designation}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground leading-relaxed">
              {existingBio.desc}
            </p>
          </div>

          {existingBio.profileImage && (
            <div>
              <h4 className="font-medium mb-2">Profile Image</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <a
                  href={existingBio.profileImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  View Profile Image
                </a>
              </div>
            </div>
          )}

          {existingBio.resumeUrl && (
            <div>
              <h4 className="font-medium mb-2">Resume</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <a
                  href={existingBio.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  View Resume
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Form mode (create or edit)
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {isUpdateMode ? "Edit Your Bio" : "Create Your Bio"}
        </CardTitle>
        <CardDescription>
          {isUpdateMode
            ? "Update your professional bio information"
            : "Fill in your professional bio information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Designations</FormLabel>
              <FormDescription className="mb-3">
                Add your professional titles or roles
              </FormDescription>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`designations.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="e.g., Software Engineer"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeDesignation(index)}
                            disabled={fields.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDesignation}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Designation
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a brief description about yourself..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tell us about your background, skills, and experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/your-photo.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link to your professional profile photo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resumeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/your-resume.pdf"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Link to your resume or CV</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createBio.isPending || updateBio.isPending}
                className="flex-1"
              >
                {createBio.isPending || updateBio.isPending
                  ? isUpdateMode
                    ? "Updating..."
                    : "Creating..."
                  : isUpdateMode
                  ? "Update Bio"
                  : "Create Bio"}
              </Button>
              {isUpdateMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
