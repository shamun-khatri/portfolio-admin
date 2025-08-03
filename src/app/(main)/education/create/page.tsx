"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Loader2,
  GraduationCap,
  Calendar,
  Award,
  School,
  FileText,
} from "lucide-react";
import {
  EducationFormValues,
  educationSchema,
} from "@/components/forms/form-schemas/education-schema"; // Import the reusable ImageUpload component
import ImageUpload from "@/components/global/image-upload";

interface EducationFormProps {
  userId: string;
  onSuccess?: () => void;
}

export default function EducationForm({
  userId,
  onSuccess,
}: EducationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      img: "",
      school: "",
      date: "",
      grade: "",
      desc: "",
      degree: "",
    },
  });

  const createEducationMutation = useMutation({
    mutationFn: async (data: EducationFormValues) => {
      const formData = new FormData();

      // Append form fields to FormData
      formData.append("school", data.school);
      formData.append("degree", data.degree);
      formData.append("date", data.date);
      formData.append("grade", data.grade);
      formData.append("desc", data.desc);

      // Append image if provided
      if (data.img) {
        formData.append("img", data.img[0]); // Assuming `img` is an array of files
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/education`,
        {
          method: "POST",
          credentials: "include",
          body: formData, // Use FormData as the request body
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create education entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education", userId] });
      alert("Education entry has been created successfully.");
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      alert(error.message || "Something went wrong. Please try again.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: EducationFormValues) => {
    setIsSubmitting(true);
    createEducationMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Add Education</CardTitle>
        </div>
        <CardDescription>
          Add your educational background and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <School className="h-4 w-4" />
                      School/Institution
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Harvard University"
                        {...field}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Degree/Program
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Bachelor of Computer Science"
                        {...field}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Duration/Year
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 2020-2024 or May 2024"
                        {...field}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the duration or graduation year
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade/GPA</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., A+, 4.0 GPA, Distinction"
                        {...field}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="img"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel>Institution Logo/Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      onFileChange={(file) => {
                        onChange(file ? [file] : undefined); // Update form state
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your achievements, coursework, activities, or any relevant details..."
                      className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share details about your academic experience, achievements,
                    or relevant coursework
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="flex-1"
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Add Education
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
