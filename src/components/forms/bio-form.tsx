import React from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Plus, X, User, Upload } from "lucide-react";
import Image from "next/image";
import { type BioFormData } from "./form-schemas/bio-schema";
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
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/global/image-upload";

interface BioFormProps {
  form: UseFormReturn<BioFormData>;
  onSubmit: (data: BioFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  existingImageUrl?: string;
}

export function BioForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
  existingImageUrl,
}: BioFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "designations",
  });

  const addDesignation = () => {
    append("");
  };

  const removeDesignation = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {mode === "edit" ? "Edit Your Bio" : "Create Your Bio"}
        </CardTitle>
        <CardDescription>
          {mode === "edit"
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
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Profile Image{" "}
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
                      ? "Upload your professional profile photo (PNG, JPG, WEBP up to 5MB). Required."
                      : "Upload your professional profile photo (PNG, JPG, WEBP up to 5MB). Leave empty to keep current image."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show existing image preview in edit mode */}
            {mode === "edit" && existingImageUrl && (
              <div className="space-y-2">
                <FormLabel>Current Profile Image</FormLabel>
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <Image
                    src={existingImageUrl}
                    alt="Current profile"
                    fill
                    className="object-cover"
                    sizes="(max-width: 128px) 100vw, 128px"
                  />
                </div>
                <FormDescription className="text-sm text-muted-foreground">
                  Upload a new image above to replace this one
                </FormDescription>
              </div>
            )}

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
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? mode === "edit"
                    ? "Updating..."
                    : "Creating..."
                  : mode === "edit"
                  ? "Update Bio"
                  : "Create Bio"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
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
