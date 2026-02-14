"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Plus, Save, Trash2, Pencil, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CustomEntity,
  DEFAULT_CATEGORY_SCHEMAS,
  DEFAULT_CATEGORY_SCHEMA_SLUGS,
  CustomEntityFieldDefinition,
  CustomEntityFieldType,
  CustomEntityType,
  getCustomEntityTypeFields,
  useCreateCustomEntity,
  useCreateCustomEntityType,
  useCustomEntitiesByType,
  useCustomEntityTypes,
  useDeleteCustomEntity,
  useDeleteCustomEntityType,
  useUpdateCustomEntity,
  useUpdateCustomEntityType,
} from "@/hooks/use-custom-entities";

const FIELD_TYPE_OPTIONS: CustomEntityFieldType[] = [
  "text",
  "textarea",
  "number",
  "date",
  "boolean",
  "select",
  "multiselect",
  "url",
  "json",
];

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

const parseValueByType = (value: string, type: CustomEntityFieldType) => {
  if (value === "") {
    return "";
  }

  if (type === "number") {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
  }

  return value;
};

const serializeValueForInput = (
  value: unknown,
  type: CustomEntityFieldType
): string | boolean => {
  if (type === "boolean") {
    return Boolean(value);
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value ?? "");
};

const getEntityId = (entity: CustomEntity) => entity.id;

export default function CustomEntitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: customEntityTypes = [], isLoading: isTypesLoading } = useCustomEntityTypes();
  const createTypeMutation = useCreateCustomEntityType();
  const updateTypeMutation = useUpdateCustomEntityType();
  const deleteTypeMutation = useDeleteCustomEntityType();

  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [editingType, setEditingType] = useState<CustomEntityType | null>(null);

  const [typeName, setTypeName] = useState("");
  const [typeSlug, setTypeSlug] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [typeFields, setTypeFields] = useState<CustomEntityFieldDefinition[]>([createEmptyField()]);

  const selectedType = useMemo(
    () => customEntityTypes.find((type) => type.id === selectedTypeId) || null,
    [customEntityTypes, selectedTypeId]
  );

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
        type: customEntityTypes.find((item) => item.slug === base.slug) || null,
      })),
    [customEntityTypes]
  );

  const isDefaultSchemaType = Boolean(
    selectedType && DEFAULT_CATEGORY_SCHEMA_SLUGS.includes(selectedType.slug)
  );

  useEffect(() => {
    const queryTypeId = searchParams.get("typeId");

    if (queryTypeId && customCategoryTypes.some((type) => type.id === queryTypeId)) {
      setSelectedTypeId(queryTypeId);
      return;
    }

    if (!selectedTypeId && customCategoryTypes.length > 0) {
      const fallbackTypeId = customCategoryTypes[0].id;
      setSelectedTypeId(fallbackTypeId);
      router.replace(`/custom-entities?typeId=${fallbackTypeId}`);
    }
  }, [customCategoryTypes, selectedTypeId, searchParams, router]);

  const {
    data: customEntities = [],
    isLoading: isEntitiesLoading,
    refetch: refetchEntities,
  } = useCustomEntitiesByType(selectedTypeId);

  const createEntityMutation = useCreateCustomEntity();
  const updateEntityMutation = useUpdateCustomEntity();
  const deleteEntityMutation = useDeleteCustomEntity();

  const [entityName, setEntityName] = useState("");
  const [entityValues, setEntityValues] = useState<Record<string, unknown>>({});
  const [editingEntity, setEditingEntity] = useState<CustomEntity | null>(null);

  const resetTypeForm = () => {
    setEditingType(null);
    setTypeName("");
    setTypeSlug("");
    setTypeDescription("");
    setTypeFields([createEmptyField()]);
  };

  const handleStartTypeEdit = (type: CustomEntityType) => {
    setEditingType(type);
    setTypeName(type.name);
    setTypeSlug(type.slug);
    setTypeDescription(type.description || "");
    const existingFields = getCustomEntityTypeFields(type);
    setTypeFields(
      existingFields.length > 0
        ? existingFields.map((field) => ({ ...field }))
        : [createEmptyField()]
    );
  };

  const handleStartDefaultSchemaEdit = (
    slug: string,
    name: string,
    type: CustomEntityType | null
  ) => {
    setEditingType(type);
    setTypeName(type?.name || name);
    setTypeSlug(slug);
    setTypeDescription(type?.description || `${name} custom field schema`);
    const existingFields = getCustomEntityTypeFields(type);
    setTypeFields(
      existingFields.length > 0
        ? existingFields.map((field) => ({ ...field }))
        : [createEmptyField()]
    );
  };

  const handleSaveType = async () => {
    const normalizedFields = typeFields.map(normalizeField);

    if (!typeName.trim() || !typeSlug.trim()) {
      alert("Name and slug are required for custom category");
      return;
    }

    if (normalizedFields.some((field) => !field.key || !field.label)) {
      alert("Every custom field must have key and label");
      return;
    }

    const duplicateKeys = normalizedFields
      .map((field) => field.key)
      .filter((key, index, collection) => collection.indexOf(key) !== index);

    if (duplicateKeys.length > 0) {
      alert("Field keys must be unique in a category");
      return;
    }

    const payload = {
      name: typeName.trim(),
      slug: toSlug(typeSlug),
      description: typeDescription.trim(),
      fieldSchema: normalizedFields,
    };

    try {
      if (editingType) {
        await updateTypeMutation.mutateAsync({ id: editingType.id, payload });
      } else {
        const created = await createTypeMutation.mutateAsync(payload);
        setSelectedTypeId(created.id);
        router.replace(`/custom-entities?typeId=${created.id}`);
      }
      resetTypeForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save custom category");
    }
  };

  const handleDeleteType = async (typeId: string) => {
    if (!confirm("Delete this custom category and all of its entries?")) {
      return;
    }

    try {
      await deleteTypeMutation.mutateAsync(typeId);
      if (selectedTypeId === typeId) {
        const nextType = customCategoryTypes.find((type) => type.id !== typeId);
        const nextTypeId = nextType?.id || "";
        setSelectedTypeId(nextTypeId);
        router.replace(nextTypeId ? `/custom-entities?typeId=${nextTypeId}` : "/custom-entities");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  const buildMetadataPayload = () => {
    if (!selectedType) {
      return {};
    }

    const payload: Record<string, unknown> = {};

    for (const field of getCustomEntityTypeFields(selectedType)) {
      const rawValue = entityValues[field.key];

      if (
        rawValue === undefined ||
        rawValue === null ||
        rawValue === "" ||
        (Array.isArray(rawValue) && rawValue.length === 0)
      ) {
        if (field.required) {
          throw new Error(`${field.label} is required`);
        }
        continue;
      }

      if (field.type === "number") {
        const numeric = Number(rawValue);
        if (Number.isNaN(numeric)) {
          throw new Error(`${field.label} must be a valid number`);
        }
        payload[field.key] = numeric;
        continue;
      }

      if (field.type === "boolean") {
        payload[field.key] = Boolean(rawValue);
        continue;
      }

      if (field.type === "multiselect") {
        if (Array.isArray(rawValue)) {
          payload[field.key] = rawValue;
        } else {
          payload[field.key] = String(rawValue)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
        continue;
      }

      if (field.type === "json") {
        if (typeof rawValue === "string") {
          try {
            payload[field.key] = JSON.parse(rawValue);
          } catch {
            throw new Error(`${field.label} must be valid JSON`);
          }
        } else {
          payload[field.key] = rawValue;
        }
        continue;
      }

      payload[field.key] = rawValue;
    }

    return payload;
  };

  const resetEntityForm = () => {
    setEditingEntity(null);
    setEntityName("");
    setEntityValues({});
  };

  const handleStartEntityEdit = (entity: CustomEntity) => {
    setEditingEntity(entity);
    setEntityName(entity.name);
    setEntityValues(entity.metadata || {});
  };

  const handleSaveEntity = async () => {
    if (!selectedType) {
      alert("Select a category first");
      return;
    }

    if (!entityName.trim()) {
      alert("Entry name is required");
      return;
    }

    const payload = {
      type_id: selectedType.id,
      name: entityName.trim(),
      metadata: buildMetadataPayload(),
    };

    try {
      if (editingEntity) {
        await updateEntityMutation.mutateAsync({ id: editingEntity.id, payload });
      } else {
        await createEntityMutation.mutateAsync(payload);
      }

      resetEntityForm();
      refetchEntities();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save custom entry");
    }
  };

  const handleDeleteEntity = async (entityId: string) => {
    if (!selectedTypeId || !confirm("Delete this custom entry?")) {
      return;
    }

    try {
      await deleteEntityMutation.mutateAsync({ id: entityId, typeId: selectedTypeId });
      if (editingEntity?.id === entityId) {
        resetEntityForm();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete custom entry");
    }
  };

  const updateFieldAt = (
    index: number,
    partial: Partial<CustomEntityFieldDefinition>
  ) => {
    setTypeFields((previous) =>
      previous.map((field, currentIndex) =>
        currentIndex === index ? { ...field, ...partial } : field
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Custom Categories</h1>
          <p className="text-muted-foreground text-sm">
            Manage schemas once, then use them consistently across create, edit, and view pages.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Category Schemas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {defaultCategoryTypes.map((item) => (
            <div key={item.slug} className="rounded-lg border p-3 space-y-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getCustomEntityTypeFields(item.type).length} configured fields
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleStartDefaultSchemaEdit(item.slug, item.name, item.type)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" /> Manage Fields
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Your Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isTypesLoading ? (
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            ) : customCategoryTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom categories yet.</p>
            ) : (
              customCategoryTypes.map((type) => (
                <div
                  key={type.id}
                  className={`rounded-lg border p-3 ${
                    selectedTypeId === type.id ? "border-primary" : "border-border"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      setSelectedTypeId(type.id);
                      router.replace(`/custom-entities?typeId=${type.id}`);
                      resetEntityForm();
                    }}
                  >
                    <p className="font-medium">{type.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">/{type.slug}</p>
                  </button>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartTypeEdit(type)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteType(type.id)}
                      disabled={deleteTypeMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {typeSlug && DEFAULT_CATEGORY_SCHEMA_SLUGS.includes(typeSlug)
                ? `Manage ${typeName || typeSlug} Schema`
                : editingType
                  ? "Edit Category"
                  : "Create Category"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Category name (e.g. Certifications)"
                value={typeName}
                disabled={Boolean(typeSlug && DEFAULT_CATEGORY_SCHEMA_SLUGS.includes(typeSlug))}
                onChange={(event) => {
                  const next = event.target.value;
                  setTypeName(next);
                  if (!editingType) {
                    setTypeSlug(toSlug(next));
                  }
                }}
              />
              <Input
                placeholder="Slug (e.g. certifications)"
                value={typeSlug}
                disabled={Boolean(typeSlug && DEFAULT_CATEGORY_SCHEMA_SLUGS.includes(typeSlug))}
                onChange={(event) => setTypeSlug(toSlug(event.target.value))}
              />
            </div>

            <Textarea
              placeholder="Description"
              value={typeDescription}
              onChange={(event) => setTypeDescription(event.target.value)}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Field Definitions</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTypeFields((previous) => [...previous, createEmptyField()])}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Field
                </Button>
              </div>

              <div className="space-y-2">
                {typeFields.map((field, index) => (
                  <div key={`${field.key}-${index}`} className="rounded-md border p-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        placeholder="Key (e.g. issuedBy)"
                        value={field.key}
                        onChange={(event) =>
                          updateFieldAt(index, {
                            key: event.target.value.replace(/\s+/g, ""),
                          })
                        }
                      />
                      <Input
                        placeholder="Label"
                        value={field.label}
                        onChange={(event) =>
                          updateFieldAt(index, { label: event.target.value })
                        }
                      />
                      <select
                        value={field.type}
                        onChange={(event) =>
                          updateFieldAt(index, {
                            type: event.target.value as CustomEntityFieldType,
                          })
                        }
                        className="h-9 rounded-md border bg-transparent px-3 text-sm"
                      >
                        {FIELD_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(field.type === "select" || field.type === "multiselect") && (
                      <Input
                        placeholder="Options (comma separated)"
                        value={(field.options || []).join(", ")}
                        onChange={(event) =>
                          updateFieldAt(index, {
                            options: event.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(field.required)}
                          onChange={(event) =>
                            updateFieldAt(index, { required: event.target.checked })
                          }
                        />
                        Required
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(field.private)}
                          onChange={(event) =>
                            updateFieldAt(index, { private: event.target.checked })
                          }
                        />
                        Private
                      </label>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setTypeFields((previous) =>
                            previous.filter((_, currentIndex) => currentIndex !== index)
                          )
                        }
                        disabled={typeFields.length <= 1}
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveType}
                disabled={createTypeMutation.isPending || updateTypeMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingType ? "Update Category" : "Create Category"}
              </Button>
              {editingType && (
                <Button variant="outline" onClick={resetTypeForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedType ? `${selectedType.name} Entries` : "Entries"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedType ? (
            <p className="text-sm text-muted-foreground">Create/select a category first.</p>
          ) : isDefaultSchemaType ? (
            <p className="text-sm text-muted-foreground">
              This is a default category schema. Entries are managed from its native section (for example,
              Education or Experience).
            </p>
          ) : (
            <>
              <div className="space-y-3 rounded-lg border p-4">
                <Input
                  placeholder="Entry name"
                  value={entityName}
                  onChange={(event) => setEntityName(event.target.value)}
                />

                {getCustomEntityTypeFields(selectedType).map((field) => {
                  const currentValue = entityValues[field.key];

                  if (field.type === "textarea" || field.type === "json") {
                    return (
                      <div key={field.key} className="space-y-1">
                        <p className="text-xs font-medium">{field.label}</p>
                        <Textarea
                          value={String(serializeValueForInput(currentValue, field.type))}
                          placeholder={field.key}
                          onChange={(event) => {
                            setEntityValues((previous) => ({
                              ...previous,
                              [field.key]: parseValueByType(event.target.value, field.type),
                            }));
                          }}
                        />
                      </div>
                    );
                  }

                  if (field.type === "boolean") {
                    return (
                      <label key={field.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(currentValue)}
                          onChange={(event) => {
                            setEntityValues((previous) => ({
                              ...previous,
                              [field.key]: event.target.checked,
                            }));
                          }}
                        />
                        {field.label}
                      </label>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <div key={field.key} className="space-y-1">
                        <p className="text-xs font-medium">{field.label}</p>
                        <select
                          value={String(currentValue ?? "")}
                          onChange={(event) => {
                            setEntityValues((previous) => ({
                              ...previous,
                              [field.key]: event.target.value,
                            }));
                          }}
                          className="h-9 rounded-md border bg-transparent px-3 text-sm w-full"
                        >
                          <option value="">Select</option>
                          {(field.options || []).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === "multiselect") {
                    return (
                      <div key={field.key} className="space-y-1">
                        <p className="text-xs font-medium">{field.label}</p>
                        <Input
                          value={String(serializeValueForInput(currentValue, field.type))}
                          placeholder="option1, option2"
                          onChange={(event) => {
                            setEntityValues((previous) => ({
                              ...previous,
                              [field.key]: event.target.value
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean),
                            }));
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.key} className="space-y-1">
                      <p className="text-xs font-medium">{field.label}</p>
                      <Input
                        type={
                          field.type === "number"
                            ? "number"
                            : field.type === "date"
                              ? "date"
                              : field.type === "url"
                                ? "url"
                                : "text"
                        }
                        value={String(serializeValueForInput(currentValue, field.type))}
                        placeholder={field.key}
                        onChange={(event) => {
                          setEntityValues((previous) => ({
                            ...previous,
                            [field.key]: parseValueByType(event.target.value, field.type),
                          }));
                        }}
                      />
                    </div>
                  );
                })}

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveEntity}
                    disabled={createEntityMutation.isPending || updateEntityMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingEntity ? "Update Entry" : "Create Entry"}
                  </Button>
                  {editingEntity && (
                    <Button variant="outline" onClick={resetEntityForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {isEntitiesLoading ? (
                <p className="text-sm text-muted-foreground">Loading entries...</p>
              ) : customEntities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No entries found.</p>
              ) : (
                <div className="space-y-3">
                  {customEntities.map((entity) => (
                    <div key={getEntityId(entity)} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{entity.name}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(entity.metadata || {}).map(([key, value]) => (
                              <Badge key={key} variant="secondary">
                                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEntityEdit(entity)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteEntity(getEntityId(entity))}
                            disabled={deleteEntityMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
