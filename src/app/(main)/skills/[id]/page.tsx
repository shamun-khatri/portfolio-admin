"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Eye,
  BrainCircuit,
  Tag,
  Loader2,
  Trash2,
} from "lucide-react";
import SkillForm from "@/components/forms/skill-form";
import { useSkill, useUpdateSkill, useDeleteSkill } from "@/hooks/use-skills";
import {
  skillCreateSchema,
  type SkillFormData,
} from "@/components/forms/form-schemas/skill-schema";
import { useSession } from "next-auth/react";

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data } = useSession();
  const skillId = params.id as string;
  const userId = data?.user?.id;

  const [isEditing, setIsEditing] = useState(false);

  const { data: skill, isLoading, error } = useSkill(userId!, skillId);
  const updateSkillMutation = useUpdateSkill(skillId);
  const deleteSkillMutation = useDeleteSkill();

  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillCreateSchema),
    defaultValues: {
      name: "",
      category: "",
      icon: undefined,
    },
  });

  // Load skill data into form when available
  useEffect(() => {
    if (skill && !isLoading) {
      form.reset({
        name: skill.name || "",
        category: skill.category || "",
        icon: undefined, // Reset to undefined for edit mode
      });
    }
  }, [skill, isLoading, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (skill) {
      form.reset({
        name: skill.name,
        category: skill.category,
        icon: undefined,
      });
    }
  };

  const handleUpdate = async (data: SkillFormData) => {
    try {
      await updateSkillMutation.mutateAsync(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update skill:", error);
    }
  };

  const handleDelete = async () => {
    if (!skill) return;

    if (!confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      return;
    }

    try {
      await deleteSkillMutation.mutateAsync(skillId);
      router.push("/skills");
    } catch (error) {
      console.error("Failed to delete skill:", error);
      alert("Failed to delete skill. Please try again.");
    }
  };

  if (isLoading || !userId) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Skill Not Found
            </h3>
            <p className="text-muted-foreground">
              The skill you&apos;re looking for doesn&apos;t exist or has been
              deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to View
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Skill</h1>
            <p className="text-muted-foreground">
              Update &quot;{skill.name}&quot; details
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <SkillForm
          form={form}
          onSubmit={handleUpdate}
          onCancel={handleCancelEdit}
          isSubmitting={updateSkillMutation.isPending}
          mode="edit"
          existingIconUrl={skill.icon}
        />
      </div>
    );
  }

  // View Mode
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Skills
        </Button>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Viewing skill</span>
        </div>
      </div>

      {/* Skill Display */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">{skill.name}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-sm capitalize">
                {skill.category}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEdit}
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                size="sm"
                variant="destructive"
                disabled={deleteSkillMutation.isPending}
                className="flex items-center gap-2"
              >
                {deleteSkillMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Skill Icon */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BrainCircuit className="h-4 w-4" />
              Skill Icon
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted border">
                <Image
                  src={skill.icon}
                  alt={`${skill.name} icon`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 64px) 100vw, 64px"
                />
              </div>
              <div>
                <p className="font-medium">{skill.name}</p>
                <p className="text-sm text-muted-foreground">Technology Icon</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Skill Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BrainCircuit className="h-4 w-4" />
                Skill Name
              </div>
              <p className="text-lg font-medium">{skill.name}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="h-4 w-4" />
                Category
              </div>
              <Badge variant="outline" className="text-sm capitalize">
                {skill.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
