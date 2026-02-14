"use client";

import { use, useMemo, useState } from "react";
import {
  Plus,
  Save,
  Pencil,
  Trash2,
  Layers,
  ArrowLeft,
  Loader2,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CustomEntity,
  CustomEntityFieldDefinition,
  CustomEntityFieldType,
  CustomEntityType,
  getCustomEntityTypeFields,
  useCreateCustomEntity,
  useCustomEntitiesByType,
  useCustomEntityTypes,
  useDeleteCustomEntity,
  useUpdateCustomEntity,
} from "@/hooks/use-custom-entities";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const parseValueByType = (value: string, type: CustomEntityFieldType) => {
  if (value === "") return "";
  if (type === "number") {
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  }
  return value;
};

const serialize = (value: unknown, type: CustomEntityFieldType): string => {
  if (type === "boolean") return "";
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CategoryEntriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: types = [], isLoading: typesLoading } = useCustomEntityTypes();

  const categoryType: CustomEntityType | null = useMemo(
    () => types.find((t) => t.slug === slug) || null,
    [types, slug]
  );

  const typeId = categoryType?.id || "";
  const fields = getCustomEntityTypeFields(categoryType);

  const {
    data: entries = [],
    isLoading: entriesLoading,
    refetch,
  } = useCustomEntitiesByType(typeId);

  const createMut = useCreateCustomEntity();
  const updateMut = useUpdateCustomEntity();
  const deleteMut = useDeleteCustomEntity();

  const [name, setName] = useState("");
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<CustomEntity | null>(null);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setValues({});
    setShowForm(false);
  };

  const startEdit = (entity: CustomEntity) => {
    setEditing(entity);
    setName(entity.name);
    setValues(entity.metadata || {});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.key];
      if (
        raw === undefined ||
        raw === null ||
        raw === "" ||
        (Array.isArray(raw) && !raw.length)
      ) {
        if (field.required) throw new Error(`${field.label} is required`);
        continue;
      }
      if (field.type === "number") {
        const n = Number(raw);
        if (Number.isNaN(n)) throw new Error(`${field.label} must be a number`);
        payload[field.key] = n;
        continue;
      }
      if (field.type === "boolean") {
        payload[field.key] = Boolean(raw);
        continue;
      }
      if (field.type === "multiselect") {
        payload[field.key] = Array.isArray(raw)
          ? raw
          : String(raw)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
        continue;
      }
      if (field.type === "json") {
        if (typeof raw === "string") {
          try {
            payload[field.key] = JSON.parse(raw);
          } catch {
            throw new Error(`${field.label} must be valid JSON`);
          }
        } else {
          payload[field.key] = raw;
        }
        continue;
      }
      if (field.type === "image" && raw instanceof File) {
        payload[field.key] = raw;
        continue;
      }
      payload[field.key] = raw;
    }
    return payload;
  };

  const handleSave = async () => {
    if (!categoryType) return;
    if (!name.trim()) {
      alert("Entry name is required");
      return;
    }
    try {
      const metadata = buildPayload();
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          payload: { type_id: categoryType.id, name: name.trim(), metadata },
        });
      } else {
        await createMut.mutateAsync({
          type_id: categoryType.id,
          name: name.trim(),
          metadata,
        });
      }
      resetForm();
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await deleteMut.mutateAsync({ id, typeId });
      if (editing?.id === id) resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  /* ---- loading / not found states ---- */

  if (typesLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!categoryType) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="h-14 w-14 mx-auto rounded-full bg-muted flex items-center justify-center">
          <Layers className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Category not found</h2>
        <p className="text-muted-foreground text-sm">
          No category with slug &quot;{slug}&quot; exists.
        </p>
        <Button asChild variant="outline">
          <Link href="/custom-fields">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Custom Fields
          </Link>
        </Button>
      </div>
    );
  }

  /* ---- field renderer ---- */

  const renderField = (field: CustomEntityFieldDefinition) => {
    const val = values[field.key];

    if (field.type === "image") {
      const src = typeof val === "string" ? val : "";
      return (
        <div key={field.key} className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setValues((p) => ({ ...p, [field.key]: file || "" }));
            }}
          />
          {src && (
            <Image
              src={src}
              alt={field.label}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 rounded-lg border object-cover"
            />
          )}
        </div>
      );
    }

    if (field.type === "textarea" || field.type === "json") {
      return (
        <div key={field.key} className="space-y-2">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
          <Textarea
            value={serialize(val, field.type)}
            placeholder={
              field.type === "json" ? '{"key": "value"}' : field.label
            }
            className={field.type === "json" ? "font-mono text-xs" : ""}
            onChange={(e) =>
              setValues((p) => ({
                ...p,
                [field.key]: parseValueByType(e.target.value, field.type),
              }))
            }
          />
        </div>
      );
    }

    if (field.type === "boolean") {
      return (
        <label
          key={field.key}
          className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <input
            type="checkbox"
            checked={Boolean(val)}
            onChange={(e) =>
              setValues((p) => ({ ...p, [field.key]: e.target.checked }))
            }
            className="h-4 w-4 rounded"
          />
          <span className="text-sm font-medium">{field.label}</span>
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.key} className="space-y-2">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
          <select
            value={String(val ?? "")}
            onChange={(e) =>
              setValues((p) => ({ ...p, [field.key]: e.target.value }))
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select…</option>
            {(field.options || []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "multiselect") {
      return (
        <div key={field.key} className="space-y-2">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
          <Input
            value={serialize(val, field.type)}
            placeholder="item1, item2, item3"
            onChange={(e) =>
              setValues((p) => ({
                ...p,
                [field.key]: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>
      );
    }

    const inputType =
      field.type === "number"
        ? "number"
        : field.type === "date"
          ? "date"
          : field.type === "url"
            ? "url"
            : "text";

    return (
      <div key={field.key} className="space-y-2">
        <label className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>
        <Input
          type={inputType}
          value={serialize(val, field.type)}
          placeholder={field.label}
          onChange={(e) =>
            setValues((p) => ({
              ...p,
              [field.key]: parseValueByType(e.target.value, field.type),
            }))
          }
        />
      </div>
    );
  };

  /* ---- main render ---- */

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/custom-fields"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Custom Fields
              </Link>
              <span className="text-muted-foreground">/</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {categoryType.name}
            </h1>
            {categoryType.description && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {categoryType.description}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {editing ? `Edit — ${editing.name}` : "New Entry"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Entry name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {fields.length > 0 && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map(renderField)}
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={createMut.isPending || updateMut.isPending}
              >
                {(createMut.isPending || updateMut.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                {editing ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      {entriesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5 space-y-3">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted/60" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Layers className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">
              No entries in {categoryType.name}
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Create your first entry to start building this collection.
            </p>
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="group hover:shadow-md transition-all duration-200 border-border/60 hover:border-primary/30"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate">
                      {entry.name}
                    </p>
                    {Object.keys(entry.metadata || {}).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {Object.entries(entry.metadata || {}).map(
                          ([key, value]) => {
                            const fieldDef = fields.find(
                              (f) => f.key === key
                            );
                            const label = fieldDef?.label || key;
                            const display = Array.isArray(value)
                              ? value.join(", ")
                              : String(value);

                            if (
                              fieldDef?.type === "image" &&
                              typeof value === "string" &&
                              value
                            ) {
                              return (
                                <Image
                                  key={key}
                                  src={value}
                                  alt={label}
                                  width={48}
                                  height={48}
                                  unoptimized
                                  className="h-12 w-12 rounded-md border object-cover"
                                />
                              );
                            }

                            return (
                              <Badge
                                key={key}
                                variant="secondary"
                                className="text-[11px] font-normal max-w-[200px] truncate"
                              >
                                <span className="font-medium mr-1">
                                  {label}:
                                </span>
                                {display.length > 60
                                  ? display.slice(0, 57) + "…"
                                  : display}
                              </Badge>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(entry)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
