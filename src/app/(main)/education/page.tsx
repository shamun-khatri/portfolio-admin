"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Calendar,
  School,
  GripVertical,
  Save,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Education = {
  id: string;
  img: string;
  school: string;
  degree: string;
  date: string;
  grade: string;
  desc: string;
  position?: number;
};

// Sortable Education Card Component
function SortableEducationCard({
  education,
  onDelete,
}: {
  education: Education;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: education.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.01] border bg-card hover:bg-accent/5 p-0"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing rounded bg-background/90 p-1.5 shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <CardHeader className="pb-4 pl-14 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <Avatar className="w-16 h-16 border-2 border-background relative">
                <AvatarImage
                  src={education.img || "/placeholder.svg"}
                  alt={`${education.school} logo`}
                />
                <AvatarFallback className="text-lg font-semibold bg-muted">
                  {education.school.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text mb-1">
                {education.school}
              </h3>
              <div className="flex items-center text-muted-foreground mb-1">
                <School className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-medium">{education.degree}</span>
              </div>
              <div className="flex items-center text-muted-foreground/80">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-sm">{education.date}</span>
              </div>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Grade: {education.grade}
              </div>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 shadow-sm border bg-background"
              onClick={() => (window.location.href = `/education/${education.id}`)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 shadow-sm border bg-background"
              onClick={() => onDelete(education.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pl-14 pb-6 relative z-10">
        <p className="text-muted-foreground leading-relaxed italic text-sm">
          {education.desc}
        </p>
      </CardContent>
    </Card>
  );
}

const EducationPage = () => {
  const { data: session } = useSession();
  const [educationOrder, setEducationOrder] = useState<Education[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    data: educationEntries = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Education[]>({
    queryKey: ["education", session?.user?.id],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/education/${session?.user?.id}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch education entries");
      }
      const data = await response.json();
      return data.sort((a: Education, b: Education) => (a.position ?? 999) - (b.position ?? 999));
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (educationEntries.length > 0) {
      setEducationOrder(educationEntries);
      setHasChanges(false);
    }
  }, [educationEntries]);

  const saveOrderMutation = useMutation({
    mutationFn: async (order: string[]) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/reorder`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!response.ok) throw new Error("Failed to reorder education");
      return response.json();
    },
    onSuccess: () => {
      setHasChanges(false);
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete education");
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this education entry?")) {
      deleteMutation.mutate(id);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEducationOrder((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  const handleSaveOrder = () => {
    const order = educationOrder.map((e) => e.id);
    saveOrderMutation.mutate(order);
  };

  const handleReset = () => {
    setEducationOrder(educationEntries);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
        <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <School className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">Failed to load education entries. Please try again.</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Save Alert */}
        {hasChanges && (
          <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-2">
            <Card className="shadow-2xl border-primary bg-background/95 backdrop-blur-md">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Save className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Unsaved Changes</p>
                  <p className="text-xs text-muted-foreground">
                    Save to update education order
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={saveOrderMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSaveOrder}
                    disabled={saveOrderMutation.isPending}
                  >
                    {saveOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-foreground dark:via-blue-400 dark:to-purple-400">
                  Education
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Manage your educational background
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              disabled={isFetching}
              className="hover:bg-accent/50 group"
            >
              <RefreshCw className={`h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => (window.location.href = "/education/create")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Add Education
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={educationOrder.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {educationOrder.map((education) => (
                  <SortableEducationCard
                    key={education.id}
                    education={education}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {educationOrder.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/30 backdrop-blur-sm">
              <School className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Academic history is empty</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                No education entries found. Add your first degree or school.
              </p>
              <Button 
                onClick={() => (window.location.href = "/education/create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              >
                Add Your First Entry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
