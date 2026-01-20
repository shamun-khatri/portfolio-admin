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
function SortableEducationCard({ education }: { education: Education }) {
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
      className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative group"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing rounded bg-background/90 p-1.5 shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <CardHeader className="pb-4 pl-12">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16 border-2 border-gray-200">
              <AvatarImage
                src={education.img || "/placeholder.svg"}
                alt={`${education.school} logo`}
              />
              <AvatarFallback className="text-lg font-semibold">
                {education.school.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {education.school}
              </h3>
              <div className="flex items-center text-gray-600 mb-1">
                <School className="w-4 h-4 mr-2" />
                <span className="font-medium">{education.degree}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">{education.date}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <span className="text-sm font-medium">
                  Grade: {education.grade}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => (window.location.href = `/education/${education.id}`)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pl-12">
        <p className="text-gray-700 leading-relaxed mb-4">
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
        `${process.env.NEXT_PUBLIC_API_URL}/education/${session?.user?.id}`
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
    return <p className="text-center text-red-500 py-10">Failed to load education entries.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Save Alert */}
      {hasChanges && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2">
          <Card className="shadow-lg border-primary">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-sm">Unsaved Changes</p>
                <p className="text-xs text-muted-foreground">
                  Save to update education order
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={saveOrderMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveOrder}
                  disabled={saveOrderMutation.isPending}
                >
                  {saveOrderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Education</h1>
          <p className="text-muted-foreground">Manage your educational background</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => (window.location.href = "/education/create")}>
            Add Education
          </Button>
        </div>
      </div>

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
              <SortableEducationCard key={education.id} education={education} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {educationOrder.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/50">
          <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No education history</h3>
          <p className="text-muted-foreground mb-6">Start by adding your first degree or school.</p>
          <Button onClick={() => (window.location.href = "/education/create")}>
            Add Education
          </Button>
        </div>
      )}
    </div>
  );
};

export default EducationPage;
