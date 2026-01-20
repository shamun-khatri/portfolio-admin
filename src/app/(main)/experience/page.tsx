"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Calendar,
  Building2,
  GripVertical,
  Save,
  Loader2,
  RefreshCw,
  Briefcase,
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

type Experience = {
  id: string;
  img: string;
  role: string;
  company: string;
  date: string;
  desc: string;
  skills: string[];
  position?: number;
};

// Sortable Experience Card Component
function SortableExperienceCard({ experience }: { experience: Experience }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience.id });

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
                src={experience.img || "/placeholder.svg"}
                alt={`${experience.company} logo`}
              />
              <AvatarFallback className="text-lg font-semibold">
                {experience.company.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {experience.role}
              </h3>
              <div className="flex items-center text-gray-600 mb-1">
                <Building2 className="w-4 h-4 mr-2" />
                <span className="font-medium">{experience.company}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">{experience.date}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => (window.location.href = `/experience/${experience.id}`)}
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
          {experience.desc}
        </p>
      </CardContent>

      <CardFooter className="pt-0 pl-12">
        <div className="w-full">
          {experience.skills && experience.skills.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {experience.skills.map((skill, skillIndex) => (
                  <Badge
                    key={skillIndex}
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No skills listed</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

const Page = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id || "111316734788280692226"; // Fallback for testing as seen in original code

  const [experienceOrder, setExperienceOrder] = useState<Experience[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    data: experiencesRaw = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Experience[]>({
    queryKey: ["experiences", userId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/experiences/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch experiences");
      }
      const data = await response.json();
      return data.sort((a: Experience, b: Experience) => (a.position ?? 999) - (b.position ?? 999));
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (experiencesRaw.length > 0) {
      setExperienceOrder(experiencesRaw);
      setHasChanges(false);
    }
  }, [experiencesRaw]);

  const saveOrderMutation = useMutation({
    mutationFn: async (order: string[]) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/reorder`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!response.ok) throw new Error("Failed to reorder experiences");
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
      setExperienceOrder((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  const handleSaveOrder = () => {
    const order = experienceOrder.map((e) => e.id);
    saveOrderMutation.mutate(order);
  };

  const handleReset = () => {
    setExperienceOrder(experiencesRaw);
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
    return <p className="text-center text-red-500 py-10">Failed to load experiences.</p>;
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
                  Save to update experience order
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
          <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-muted-foreground">Manage your professional work history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => (window.location.href = "/experience/create")}>
            Add Experience
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={experienceOrder.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {experienceOrder.map((experience) => (
              <SortableExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {experienceOrder.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/50">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No work experience</h3>
          <p className="text-muted-foreground mb-6">Start by adding your first professional role.</p>
          <Button onClick={() => (window.location.href = "/experience/create")}>
            Add Experience
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
