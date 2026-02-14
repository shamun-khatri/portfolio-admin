"use client";

import { Suspense, useMemo, useState } from "react";
import {
  Settings2,
  Plus,
  Save,
  Trash2,
  Pencil,
  X,
  Layers,
  ChevronRight,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  ImageIcon,
  Link2,
  List,
  Code2,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_CATEGORY_SCHEMAS,
  DEFAULT_CATEGORY_SCHEMA_SLUGS,
  CustomEntityFieldDefinition,
  CustomEntityFieldType,
  CustomEntityType,
  getCustomEntityTypeFields,
  useCreateCustomEntityType,
  useCustomEntityTypes,
  useDeleteCustomEntityType,
  useUpdateCustomEntityType,
} from "@/hooks/use-custom-entities";

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const FIELD_TYPE_OPTIONS: CustomEntityFieldType[] = [
  "text",
  "textarea",
  "number",
  "date",
  "image",
  "boolean",
  "select",
  "multiselect",
  "url",
  "json",
];

const FIELD_TYPE_ICONS: Record<CustomEntityFieldType, React.ReactNode> = {
  text: <Type className="h-3.5 w-3.5" />,
  textarea: <FileText className="h-3.5 w-3.5" />,
  number: <Hash className="h-3.5 w-3.5" />,
  date: <Calendar className="h-3.5 w-3.5" />,
  image: <ImageIcon className="h-3.5 w-3.5" />,
  boolean: <ToggleLeft className="h-3.5 w-3.5" />,
  select: <List className="h-3.5 w-3.5" />,
  multiselect: <List className="h-3.5 w-3.5" />,
  url: <Link2 className="h-3.5 w-3.5" />,
  json: <Code2 className="h-3.5 w-3.5" />,
};

const createEmptyField = (): CustomEntityFieldDefinition => ({
  key: "",
  label: "",
  type: "text",
  required: false,
  private: false,
  options: [],
});

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const normalizeField = (
  field: CustomEntityFieldDefinition
): CustomEntityFieldDefinition => ({
  ...field,
  key: field.key.trim(),
  label: field.label.trim(),
  options: field.options?.filter(Boolean) || [],
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function CustomFieldsContent() {
  const router = useRouter();
  const { data: customEntityTypes = [], isLoading } = useCustomEntityTypes();
  const createTypeMutation = useCreateCustomEntityType();
  const updateTypeMutation = useUpdateCustomEntityType();
  const deleteTypeMutation = useDeleteCustomEntityType();

  const [editingType, setEditingType] = useState<CustomEntityType | null>(null);
  const [editingSlug, setEditingSlug] = useState<string>("");
  const [typeName, setTypeName] = useState("");
  const [typeSlug, setTypeSlug] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [typeFields, setTypeFields] = useState<CustomEntityFieldDefinition[]>([
    createEmptyField(),
  ]);

  const customCategoryTypes = useMemo(
    () =>
      customEntityTypes.filter(
        (type) => !DEFAULT_CATEGORY_SCHEMA_SLUGS.includes(type.slug)
      ),
    [customEntityTypes]
  );

  const defaultCategoryTypes = useMemo(
    () =>
      DEFAULT_CATEGORY_SCHEMAS.map((base) => ({
        ...base,
        type:
          customEntityTypes.find((item) => item.slug === base.slug) || null,
      })),
    [customEntityTypes]
  );

  const isDefaultSchema = DEFAULT_CATEGORY_SCHEMA_SLUGS.includes(editingSlug);

  /* ---- form helpers ---- */

  const resetForm = () => {
    setEditingType(null);
    setEditingSlug("");
    setTypeName("");
    setTypeSlug("");
    setTypeDescription("");
    setTypeFields([createEmptyField()]);
  };

  const startEdit = (type: CustomEntityType) => {
    setEditingType(type);
    setEditingSlug(type.slug);
    setTypeName(type.name);
    setTypeSlug(type.slug);
    setTypeDescription(type.description || "");
    const fields = getCustomEntityTypeFields(type);
    setTypeFields(
      fields.length > 0
        ? fields.map((f) => ({ ...f }))
        : [createEmptyField()]
    );
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const startDefaultEdit = (
    slug: string,
    name: string,
    type: CustomEntityType | null
  ) => {
    setEditingType(type);
    setEditingSlug(slug);
    setTypeName(type?.name || name);
    setTypeSlug(slug);
    setTypeDescription(type?.description || `${name} custom field schema`);
    const fields = getCustomEntityTypeFields(type);
    setTypeFields(
      fields.length > 0
        ? fields.map((f) => ({ ...f }))
        : [createEmptyField()]
    );
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const updateFieldAt = (
    index: number,
    partial: Partial<CustomEntityFieldDefinition>
  ) => {
    setTypeFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...partial } : f))
    );
  };

  const handleSave = async () => {
    const fields = typeFields.map(normalizeField);
    if (!typeName.trim() || !typeSlug.trim()) {
      alert("Name and slug are required");
      return;
    }
    if (fields.some((f) => !f.key || !f.label)) {
      alert("Every field needs a key and label");
      return;
    }
    const dupes = fields
      .map((f) => f.key)
      .filter((k, i, a) => a.indexOf(k) !== i);
    if (dupes.length) {
      alert("Field keys must be unique");
      return;
    }

    const payload = {
      name: typeName.trim(),
      slug: toSlug(typeSlug),
      description: typeDescription.trim(),
      fieldSchema: fields,
    };

    try {
      if (editingType) {
        await updateTypeMutation.mutateAsync({
          id: editingType.id,
          payload,
        });
      } else {
        await createTypeMutation.mutateAsync(payload);
      }
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category and all its entries?")) return;
    try {
      await deleteTypeMutation.mutateAsync(id);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  /* ---- render ---- */

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Settings2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Custom Fields</h1>
            <p className="text-muted-foreground text-sm">
              Define field schemas for default and custom categories.
            </p>
          </div>
        </div>
      </div>

      {/* -------- Default category schemas -------- */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          Default Category Schemas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {defaultCategoryTypes.map((item) => {
            const fieldCount = getCustomEntityTypeFields(item.type).length;
            return (
              <Card
                key={item.slug}
                className="group hover:shadow-md transition-all duration-200 border-border/60 hover:border-primary/40"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/15 to-purple-500/15 flex items-center justify-center">
                      <Settings2 className="h-4 w-4 text-primary" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {fieldCount} field{fieldCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      /{item.slug}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() =>
                      startDefaultEdit(item.slug, item.name, item.type)
                    }
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Manage Schema
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* -------- Custom categories list -------- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            Your Custom Categories
          </h2>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Category
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 space-y-3">
                  <div className="h-5 w-2/3 bg-muted rounded" />
                  <div className="h-4 w-1/3 bg-muted/60 rounded" />
                  <div className="h-8 w-full bg-muted/40 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : customCategoryTypes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No custom categories yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a category like &quot;Certifications&quot; or &quot;Case
                Studies&quot; to get started.
              </p>
              <Button
                size="sm"
                onClick={() =>
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1.5" /> Create First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategoryTypes.map((type) => {
              const fieldCount = getCustomEntityTypeFields(type).length;
              return (
                <Card
                  key={type.id}
                  className="group hover:shadow-md transition-all duration-200 border-border/60 hover:border-primary/40"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center">
                        <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono"
                      >
                        {fieldCount} field{fieldCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-semibold">{type.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        /{type.slug}
                      </p>
                      {type.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {type.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          router.push(`/c/${type.slug}`)
                        }
                      >
                        <ChevronRight className="h-3.5 w-3.5 mr-1" />
                        Entries
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(type)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(type.id)}
                        disabled={deleteTypeMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Separator />

      {/* -------- Schema editor -------- */}
      <section>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {isDefaultSchema
                ? `${typeName} Schema`
                : editingType
                  ? `Edit — ${typeName}`
                  : "Create New Category"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isDefaultSchema
                ? "Configure which custom metadata fields appear on this category's forms."
                : "Define the category name, slug, and its field schema."}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name & slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  placeholder="e.g. Case Studies"
                  value={typeName}
                  disabled={isDefaultSchema}
                  onChange={(e) => {
                    setTypeName(e.target.value);
                    if (!editingType) setTypeSlug(toSlug(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  placeholder="e.g. case-studies"
                  value={typeSlug}
                  disabled={isDefaultSchema}
                  onChange={(e) => setTypeSlug(toSlug(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="A short description of this category"
                value={typeDescription}
                onChange={(e) => setTypeDescription(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Field Schema</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTypeFields((prev) => [...prev, createEmptyField()])
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Field
                </Button>
              </div>

              <div className="space-y-3">
                {typeFields.map((field, idx) => (
                  <div
                    key={`${field.key}-${idx}`}
                    className="rounded-xl border bg-muted/30 p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Key
                        </label>
                        <Input
                          placeholder="fieldKey"
                          value={field.key}
                          onChange={(e) =>
                            updateFieldAt(idx, {
                              key: e.target.value.replace(/\s+/g, ""),
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Label
                        </label>
                        <Input
                          placeholder="Display Label"
                          value={field.label}
                          onChange={(e) =>
                            updateFieldAt(idx, { label: e.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateFieldAt(idx, {
                              type: e.target.value as CustomEntityFieldType,
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {FIELD_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-1 flex items-end justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            setTypeFields((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          disabled={typeFields.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {(field.type === "select" ||
                      field.type === "multiselect") && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Options (comma‑separated)
                        </label>
                        <Input
                          placeholder="Option A, Option B, Option C"
                          value={(field.options || []).join(", ")}
                          onChange={(e) =>
                            updateFieldAt(idx, {
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-5 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(field.required)}
                          onChange={(e) =>
                            updateFieldAt(idx, {
                              required: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-xs">Required</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(field.private)}
                          onChange={(e) =>
                            updateFieldAt(idx, {
                              private: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-xs">Private</span>
                      </label>
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        {FIELD_TYPE_ICONS[field.type]}
                        {field.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={
                  createTypeMutation.isPending || updateTypeMutation.isPending
                }
              >
                <Save className="h-4 w-4 mr-2" />
                {editingType ? "Update" : "Create Category"}
              </Button>
              {(editingType || isDefaultSchema) && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function CustomFieldsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading...
        </div>
      }
    >
      <CustomFieldsContent />
    </Suspense>
  );
}
