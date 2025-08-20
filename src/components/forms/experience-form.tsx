"use client";

import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { ExperienceFormValues } from "./form-schemas/experience-schema";
import { ExperienceUpdateFormValues } from "./form-schemas/experience-update-schema";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

type ExperienceFormValuesUnion = ExperienceFormValues | ExperienceUpdateFormValues;

interface ExperienceFormProps {
  form: UseFormReturn<ExperienceFormValuesUnion>;
  handleSubmit: (data: ExperienceFormValuesUnion) => void;
  initialPreview?: string | null;
  submitLabel?: string;
  resetLabel?: string;
}

function ExperienceForm({
  form,
  handleSubmit,
  initialPreview,
  submitLabel = "Create Experience",
  resetLabel = "Reset",
}: ExperienceFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialPreview || null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    form.setValue("img", [file]);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    form.setValue("img", undefined);
    setPreview(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your experience..."
                  className="min-h-[100px]"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter company name"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
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
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your role"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
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
                <Input
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="img"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag & drop a file here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileChange(file);
                          onChange([file]);
                        }
                      }}
                    />
                  </div>

                  {preview && (
                    <div className="relative">
                      <div className="w-full h-48 relative overflow-hidden rounded-lg">
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setPreview(initialPreview || null);
            }}
          >
            {resetLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ExperienceForm;
