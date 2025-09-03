"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGroupedSkills, useDeleteSkill } from "@/hooks/use-skills";
import type { Skill } from "@/components/forms/form-schemas/skill-schema";

export default function SkillsPage() {
  const { data: groupedSkills, isLoading, error } = useGroupedSkills();
  const deleteSkillMutation = useDeleteSkill();
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);

  const handleDelete = async (skillId: string, skillName: string) => {
    if (!confirm(`Are you sure you want to delete "${skillName}"?`)) {
      return;
    }

    setDeletingSkillId(skillId);
    try {
      await deleteSkillMutation.mutateAsync(skillId);
    } catch (error) {
      console.error("Failed to delete skill:", error);
      alert("Failed to delete skill. Please try again.");
    } finally {
      setDeletingSkillId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-foreground dark:via-blue-400 dark:to-purple-400">
                    Skills Portfolio
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Loading your technical skills...
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-muted rounded-xl"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted/60 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/20 dark:from-destructive/20 dark:to-destructive/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BrainCircuit className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-destructive mb-3">
              Unable to Load Skills
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We encountered an error while loading your skills. Please refresh
              the page or try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categories = groupedSkills ? Object.keys(groupedSkills) : [];
  const totalSkills = groupedSkills
    ? Object.values(groupedSkills).flat().length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
      <div className="container mx-auto py-8 px-4">
        {/* Enhanced Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-foreground dark:via-blue-400 dark:to-purple-400">
                  Skills Portfolio
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Manage your technical skills and expertise
                </p>
              </div>
            </div>

            {totalSkills > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-full border border-blue-200 dark:border-blue-800">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {totalSkills} skill{totalSkills !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-950 rounded-full border border-purple-200 dark:border-purple-800">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-purple-700 dark:text-purple-300">
                    {categories.length} categor
                    {categories.length !== 1 ? "ies" : "y"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Link href="/skills/create">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Skill
            </Button>
          </Link>
        </div>

        {/* Enhanced Skills Grid */}
        {!groupedSkills || categories.length === 0 ? (
          <Card className="text-center py-16 shadow-xl">
            <CardContent>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BrainCircuit className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                No Skills Added Yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                Start building your skills portfolio by adding your first
                technical skill and showcase your expertise
              </p>
              <Link href="/skills/create">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Skill
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold capitalize bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                      {category}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-sm px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium"
                    >
                      {groupedSkills[category].length} skill
                      {groupedSkills[category].length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedSkills[category].map((skill: Skill) => (
                    <Card
                      key={skill.id}
                      className="group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border bg-card hover:bg-accent/5 p-0"
                    >
                      {/* Gradient border effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Content */}
                      <CardContent className="relative p-6">
                        {/* DEBUG: Added red background to see if changes apply */}

                        {/* Skill Icon - fixed size without fill */}
                        <div className="flex justify-center mb-6">
                          <div className="w-16 h-16 rounded-lg bg-muted group-hover:bg-accent flex items-center justify-center border border-border transition-all duration-300 shadow-sm">
                            <Image
                              src={skill.icon}
                              alt={`${skill.name} icon`}
                              width={48}
                              height={48}
                              className="object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                        </div>

                        {/* Skill Details - properly visible below icon */}
                        <div className="text-center space-y-3">
                          <h3 className="font-semibold text-lg text-foreground leading-tight">
                            {skill.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-xs px-3 py-1 capitalize font-medium"
                          >
                            {skill.category}
                          </Badge>
                        </div>

                        {/* Action buttons - positioned at top right */}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Link href={`/skills/${skill.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-md bg-background/80 hover:bg-blue-100 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 border border-border shadow-sm transition-all duration-200"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-md bg-background/80 hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 border border-border shadow-sm transition-all duration-200"
                            onClick={() => handleDelete(skill.id, skill.name)}
                            disabled={deletingSkillId === skill.id}
                          >
                            {deletingSkillId === skill.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Enhanced separator between categories */}
                {category !== categories[categories.length - 1] && (
                  <div className="mt-12 mb-4 flex items-center">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    <div className="px-4">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
