import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Code, Upload } from "lucide-react";
import Image from "next/image";
import { type SkillFormData } from "./form-schemas/skill-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface SkillFormProps {
  form: UseFormReturn<SkillFormData>;
  onSubmit: (data: SkillFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  existingIconUrl?: string;
}

export function SkillForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
  existingIconUrl,
}: SkillFormProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          {mode === "edit" ? "Edit Skill" : "Add New Skill"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Skill Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., React, Python, Figma"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the name of the skill or technology
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
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Frontend, Backend, Design, Tools"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Category to group this skill under
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Skill Icon */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Skill Icon{" "}
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
                      ? "Upload an icon for this skill (PNG, JPG, WEBP, SVG up to 2MB). Required."
                      : "Upload an icon for this skill (PNG, JPG, WEBP, SVG up to 2MB). Leave empty to keep current icon."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show existing icon preview in edit mode */}
            {mode === "edit" && existingIconUrl && (
              <div className="space-y-2">
                <FormLabel>Current Skill Icon</FormLabel>
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={existingIconUrl}
                    alt="Current skill icon"
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 64px) 100vw, 64px"
                  />
                </div>
                <FormDescription className="text-sm text-muted-foreground">
                  Upload a new icon above to replace this one
                </FormDescription>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? mode === "edit"
                    ? "Updating..."
                    : "Creating..."
                  : mode === "edit"
                  ? "Update Skill"
                  : "Create Skill"}
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

export default SkillForm;
