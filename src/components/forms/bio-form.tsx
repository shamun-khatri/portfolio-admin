import React from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Plus, X, User, Upload, FileText } from "lucide-react";
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
import MetadataBuilder from "@/components/global/metadata-builder";

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
    <Card className="w-full relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[32px]">
      {/* Decorative Gradient elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -z-10 rounded-full" />

      <CardHeader className="p-8 pb-4 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <User className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black tracking-tight">
              {mode === "edit" ? "Refine Portfolio Persona" : "Create Professional Identity"}
            </CardTitle>
            <CardDescription className="text-base font-medium text-muted-foreground/80 mt-1">
              {mode === "edit" 
                ? "Update your professional narrative and titles." 
                : "Establish your presence with a compelling bio."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Essential Info */}
              <div className="lg:col-span-7 space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                        Display Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your professional full name" 
                          {...field} 
                          className="bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-2xl h-14 text-lg font-bold transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">
                        Designations
                      </FormLabel>
                      <FormDescription className="text-[11px] font-medium opacity-70 mt-0.5">
                        Add titles like &ldquo;Full Stack Engineer&rdquo; or &ldquo;UI Designer&rdquo;
                      </FormDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDesignation}
                      className="h-9 px-4 rounded-xl border-purple-500/20 hover:bg-purple-500/5 text-purple-600 dark:text-purple-400 gap-2 font-black text-xs uppercase"
                    >
                      <Plus className="h-4 w-4" />
                      Add Title
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`designations.${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex gap-3 group/item">
                              <FormControl>
                                <Input
                                  placeholder="Software Architect"
                                  {...field}
                                  className="bg-background/40 border-border/40 focus:border-purple-500/50 focus:ring-purple-500/10 rounded-2xl h-12 font-medium transition-all"
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDesignation(index)}
                                disabled={fields.length === 1}
                                className="h-12 w-12 rounded-2xl text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Identity */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field: { onChange } }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500/80 flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Visual Identity
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
                        <FormDescription className="text-xs text-muted-foreground/60 leading-relaxed font-medium">
                          {mode === "create"
                            ? "Essential: Professional portraits work best (Min 400x400px)"
                            : "Optional: Replace your current profile photo"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {mode === "edit" && existingImageUrl && (
                    <div className="p-4 rounded-3xl bg-muted/20 border border-border/10 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Assets</span>
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-background shadow-xl">
                        <Image
                          src={existingImageUrl}
                          alt="Current"
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-border/10" />

            {/* Full Width Section: Narrative */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="desc"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                      <FileText className="h-4 w-4" />
                      Professional Narrative
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Craft your story... Who are you as an engineer?"
                        className="min-h-[200px] bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-3xl p-8 font-medium leading-relaxed resize-none text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs font-medium opacity-60">
                      Markdown supported. Focus on your trajectory and impact.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem className="max-w-2xl space-y-3">
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/80">
                      External CV / Portfolio Document
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://cloud-storage.com/my-resume.pdf"
                        {...field}
                        className="bg-background/40 border-border/40 focus:border-slate-500/50 focus:ring-slate-500/10 rounded-2xl h-12 font-medium transition-all"
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
                  <FormItem className="max-w-2xl space-y-3">
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/80">
                      Custom Metadata
                    </FormLabel>
                    <FormControl>
                      <MetadataBuilder value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel}
                  className="w-full sm:w-auto rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs hover:bg-muted/50 transition-all"
                >
                  Discard Changes
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 rounded-2xl h-14 px-12 font-black uppercase tracking-widest text-xs"
              >
                {isSubmitting
                  ? "Synchronizing..."
                  : mode === "edit"
                  ? "Update Persona"
                  : "Finalize Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
