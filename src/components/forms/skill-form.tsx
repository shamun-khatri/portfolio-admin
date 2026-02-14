import React from "react";
import { UseFormReturn } from "react-hook-form";
import { BrainCircuit, Upload } from "lucide-react";
import Image from "next/image";
import { type SkillFormData } from "./form-schemas/skill-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/global/image-upload";
import MetadataBuilder from "@/components/global/metadata-builder";
import { useCustomFieldSchema } from "@/hooks/use-custom-entities";

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
  const { fieldSchema } = useCustomFieldSchema("skills");
  return (
    <Card className="max-w-xl mx-auto relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[32px]">
      {/* Decorative Gradient elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-[80px] -z-10 rounded-full" />

      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-black tracking-tight uppercase">
              {mode === "edit" ? "Refine Skillset" : "New Capability"}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              {/* Skill Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                      Technical Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          placeholder="e.g. Next.js, Rust, Figma"
                          {...field}
                          className="bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/10 rounded-2xl h-14 px-6 font-bold transition-all"
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
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">
                      Expertise Domain
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          placeholder="e.g. Frontend, Infrastructure, AI"
                          {...field}
                          className="bg-background/40 border-border/40 focus:border-purple-500/50 focus:ring-purple-500/10 rounded-2xl h-14 px-6 font-bold transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadataJson"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/80">
                      Custom Metadata
                    </FormLabel>
                    <FormControl>
                      <MetadataBuilder
                        value={field.value}
                        onChange={field.onChange}
                        fieldDefinitions={fieldSchema}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-border/10" />

            {/* Skill Icon */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field: { onChange } }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500/80 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Asset Visualization
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition" />
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

            {/* Show existing icon preview in edit mode */}
            {mode === "edit" && existingIconUrl && (
              <div className="p-4 rounded-3xl bg-muted/20 border border-border/10 flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-background shadow-lg bg-background">
                  <Image
                    src={existingIconUrl}
                    alt="Current skill icon"
                    fill
                    className="object-contain p-2"
                    sizes="48px"
                  />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Active Legacy Symbol
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 rounded-2xl h-14 font-black uppercase tracking-widest text-xs"
              >
                {isSubmitting
                  ? "Synchronizing..."
                  : mode === "edit"
                  ? "Update capability"
                  : "Commit capability"}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="rounded-2xl h-14 font-bold hover:bg-muted/30 transition-all px-8"
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

export default SkillForm;
