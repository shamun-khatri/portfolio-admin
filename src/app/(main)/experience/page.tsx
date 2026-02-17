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
  persistedId?: string;
  _id?: string;
  img: string;
  role: string;
  company: string;
  date: string;
  desc: string;
  skills: string[];
  position?: number;
};

type ExperienceApiItem = Partial<Experience> & {
  id?: unknown;
  _id?: unknown;
  [key: string]: unknown;
};

const getStringId = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (typeof obj.$oid === "string" && obj.$oid.trim().length > 0) {
      return obj.$oid.trim();
    }

    if (typeof obj.id === "string" && obj.id.trim().length > 0) {
      return obj.id.trim();
    }

    if (typeof obj._id === "string" && obj._id.trim().length > 0) {
      return obj._id.trim();
    }
  }

  return null;
};

const normalizeExperience = (
  item: ExperienceApiItem,
  index: number,
): Experience => {
  const persistedId = getStringId(item.id) ?? getStringId(item._id);
  const dragId = persistedId ?? `temp-experience-${index}`;

  return {
    id: dragId,
    persistedId: persistedId ?? undefined,
    _id: typeof item._id === "string" ? item._id : undefined,
    img: typeof item.img === "string" ? item.img : "",
    role: typeof item.role === "string" ? item.role : "",
    company: typeof item.company === "string" ? item.company : "",
    date: typeof item.date === "string" ? item.date : "",
    desc: typeof item.desc === "string" ? item.desc : "",
    skills: Array.isArray(item.skills) ? item.skills : [],
    position: typeof item.position === "number" ? item.position : undefined,
  };
};

// Sortable Experience Card Component
function SortableExperienceCard({
  experience,
  onDelete,
}: {
  experience: Experience;
  onDelete: (id: string) => void;
}) {
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
      className="group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.01] border bg-card hover:bg-accent/5 p-0"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 touch-none cursor-grab active:cursor-grabbing rounded bg-background/90 p-1.5 shadow-sm border opacity-80 hover:opacity-100 transition-opacity"
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
                  src={experience.img || "/placeholder.svg"}
                  alt={`${experience.company} logo`}
                />
                <AvatarFallback className="text-lg font-semibold bg-muted">
                  {experience.company.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text mb-1">
                {experience.role}
              </h3>
              <div className="flex items-center text-muted-foreground mb-1">
                <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-medium">{experience.company}</span>
              </div>
              <div className="flex items-center text-muted-foreground/80">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-sm">{experience.date}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 shadow-sm border bg-background"
              onClick={() => {
                if (!experience.persistedId) {
                  alert(
                    "This entry has an invalid ID from API and cannot be edited until data is fixed.",
                  );
                  return;
                }
                window.location.href = `/experience/${experience.persistedId}`;
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 shadow-sm border bg-background"
              onClick={() => onDelete(experience.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pl-14 relative z-10">
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {experience.desc}
        </p>
      </CardContent>

      <CardFooter className="pt-0 pl-14 pb-6 relative z-10">
        <div className="w-full">
          {experience.skills && experience.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {experience.skills.map((skill, skillIndex) => (
                <Badge
                  key={skillIndex}
                  variant="secondary"
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No skills listed
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

const Page = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

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
        `${process.env.NEXT_PUBLIC_API_URL}/experiences/${userId}`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch experiences");
      }
      const payload = await response.json();
      const rawItems: ExperienceApiItem[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      return rawItems
        .map((item, index) => normalizeExperience(item, index))
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    },
    enabled: !!userId,
  });

  useEffect(() => {
    setExperienceOrder(experiencesRaw);
    setHasChanges(false);
  }, [experiencesRaw]);

  const saveOrderMutation = useMutation({
    mutationFn: async (order: string[]) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/experiences/reorder`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }),
        },
      );
      if (!response.ok) throw new Error("Failed to reorder experiences");
      return response.json();
    },
    onSuccess: (result) => {
      const resultItems: ExperienceApiItem[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      if (resultItems.length > 0) {
        const normalized = resultItems
          .map((item, index) => normalizeExperience(item, index))
          .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
        setExperienceOrder(normalized);
      }

      setHasChanges(false);
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/experiences/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) throw new Error("Failed to delete experience");
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (id: string) => {
    if (!id || id.startsWith("temp-experience-")) {
      alert(
        "This entry has an invalid ID from API and cannot be deleted until data is fixed.",
      );
      return;
    }

    if (
      window.confirm("Are you sure you want to delete this experience entry?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExperienceOrder((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }

        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  const handleSaveOrder = () => {
    if (!userId) {
      alert("Session not ready. Please wait and try again.");
      return;
    }

    const order = experienceOrder
      .map((e) => e.persistedId)
      .filter((id): id is string => Boolean(id));

    if (order.length === 0) {
      alert("No valid experience IDs found to save order.");
      return;
    }

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

  if (status === "loading") {
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
            <Briefcase className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">
            Failed to load experience entries. Please try again.
          </p>
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
                    Save to update experience order
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
                    className="bg-primary hover:bg-primary/90 shadow-lg"
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-foreground dark:via-blue-400 dark:to-purple-400">
                  Experience
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Manage your professional work history
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
              <RefreshCw
                className={`h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={() => (window.location.href = "/experience/create")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Add Experience
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
              items={experienceOrder.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {experienceOrder.map((experience) => (
                  <SortableExperienceCard
                    key={experience.id}
                    experience={experience}
                    onDelete={(id) =>
                      handleDelete(experience.persistedId ?? id)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {experienceOrder.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/30 backdrop-blur-sm">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Work history is empty</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                No work experience found. Add your first professional role to
                showcase your career path.
              </p>
              <Button
                onClick={() => (window.location.href = "/experience/create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              >
                Add Your First Experience
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
