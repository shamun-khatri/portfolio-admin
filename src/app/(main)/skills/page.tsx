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
import { useSession } from "next-auth/react";

export default function SkillsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data: groupedSkills, isLoading, error } = useGroupedSkills(userId!);
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
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
                <BrainCircuit className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent uppercase tracking-tight">
                  Capability Matrix
                </h1>
                <p className="text-base font-medium text-muted-foreground/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {categories.length} Technical domains mapped
                </p>
              </div>
            </div>
          </div>
          <Link href="/skills/create">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs">
              <Plus className="mr-2 h-4 w-4" /> Expand Inventory
            </Button>
          </Link>
        </div>

        {categories.length === 0 ? (
          <Card className="border-2 border-dashed border-border/20 bg-card/40 backdrop-blur-xl rounded-[40px] p-20 text-center">
            <div className="w-24 h-24 rounded-3xl bg-blue-500/5 text-blue-500 flex items-center justify-center mx-auto mb-8">
              <Plus className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-black uppercase mb-4">No Capabilities Recorded</h2>
            <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">
              Start documenting your technical expertise to populate the capability matrix.
            </p>
            <Link href="/skills/create">
              <Button size="lg" className="rounded-2xl h-14 px-10 font-bold bg-blue-600 hover:bg-blue-700 shadow-xl transition-all">
                Initialize Inventory
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category} className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-blue-500/80">
                    {category}
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedSkills![category].map((skill: Skill) => (
                    <Card
                      key={skill.id}
                      className="group relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/40 hover:border-blue-500/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 rounded-[32px] border"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="relative w-14 h-14 p-1">
                            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                            <div className="relative w-full h-full rounded-xl overflow-hidden bg-background/50 flex items-center justify-center p-2.5">
                              {skill.icon ? (
                                <Image
                                  src={skill.icon}
                                  alt={skill.name}
                                  fill
                                  className="object-contain p-2"
                                  sizes="56px"
                                />
                              ) : (
                                <BrainCircuit className="h-full w-full text-blue-500/40" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <Link href={`/skills/${skill.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-500"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(skill.id!, skill.name)}
                              className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-500"
                              disabled={deletingSkillId === skill.id}
                            >
                              {deletingSkillId === skill.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-black tracking-tight group-hover:text-blue-600 transition-colors">
                              {skill.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 border-none text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full">
                                {skill.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
