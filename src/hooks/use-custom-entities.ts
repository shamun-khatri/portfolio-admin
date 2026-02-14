import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appendMetadataToFormData } from "@/lib/metadata-formdata";

export const DEFAULT_CATEGORY_SCHEMAS = [
  { slug: "bio", name: "Bio" },
  { slug: "skills", name: "Skills" },
  { slug: "experience", name: "Experience" },
  { slug: "education", name: "Education" },
  { slug: "project", name: "Project" },
] as const;

export const DEFAULT_CATEGORY_SCHEMA_SLUGS = DEFAULT_CATEGORY_SCHEMAS.map(
  (item) => item.slug
);

export type CustomEntityFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "multiselect"
  | "url"
  | "json";

export type CustomEntityFieldDefinition = {
  key: string;
  type: CustomEntityFieldType;
  label: string;
  required?: boolean;
  private?: boolean;
  options?: string[];
};

export type CustomEntityType = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  fields?: CustomEntityFieldDefinition[];
  fieldSchema?: CustomEntityFieldDefinition[];
  createdAt?: string;
  updatedAt?: string;
};

export type CustomEntity = {
  id: string;
  type_id: string;
  name: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type UpsertCustomEntityTypePayload = {
  name: string;
  slug: string;
  description?: string;
  fieldSchema: CustomEntityFieldDefinition[];
};

type UpsertCustomEntityPayload = {
  type_id: string;
  name: string;
  metadata?: Record<string, unknown>;
};

const parseArrayResponse = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }

  return [];
};

const normalizeCustomEntityType = (item: CustomEntityType): CustomEntityType => {
  const normalizedFields = item.fieldSchema ?? item.fields ?? [];

  return {
    ...item,
    fields: normalizedFields,
    fieldSchema: normalizedFields,
  };
};

export const getCustomEntityTypeFields = (
  item: CustomEntityType | null | undefined
): CustomEntityFieldDefinition[] => {
  if (!item) {
    return [];
  }

  return item.fieldSchema ?? item.fields ?? [];
};

const fetchCustomEntityTypes = async (): Promise<CustomEntityType[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-entity-types`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch custom entity types");
  }

  const payload = await response.json();
  return parseArrayResponse<CustomEntityType>(payload).map(normalizeCustomEntityType);
};

const createCustomEntityType = async (
  payload: UpsertCustomEntityTypePayload
): Promise<CustomEntityType> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-entity-types`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create custom entity type");
  }

  const result = (await response.json()) as CustomEntityType;
  return normalizeCustomEntityType(result);
};

const updateCustomEntityType = async (
  id: string,
  payload: UpsertCustomEntityTypePayload
): Promise<CustomEntityType> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-entity-types/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update custom entity type");
  }

  const result = (await response.json()) as CustomEntityType;
  return normalizeCustomEntityType(result);
};

const deleteCustomEntityType = async (id: string): Promise<void> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-entity-types/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete custom entity type");
  }
};

const fetchCustomEntitiesByType = async (typeId: string): Promise<CustomEntity[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/custom-entities/type/${typeId}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch custom entities");
  }

  const payload = await response.json();
  return parseArrayResponse<CustomEntity>(payload);
};

const toCustomEntityFormData = (payload: UpsertCustomEntityPayload): FormData => {
  const formData = new FormData();

  formData.append("type_id", payload.type_id);
  formData.append("name", payload.name);
  appendMetadataToFormData(formData, payload.metadata);

  return formData;
};

const createCustomEntity = async (
  payload: UpsertCustomEntityPayload
): Promise<CustomEntity> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-entities`, {
    method: "POST",
    credentials: "include",
    body: toCustomEntityFormData(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create custom entity");
  }

  return response.json();
};

const updateCustomEntity = async (
  id: string,
  payload: UpsertCustomEntityPayload
): Promise<CustomEntity> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-entities/${id}`, {
    method: "PUT",
    credentials: "include",
    body: toCustomEntityFormData(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update custom entity");
  }

  return response.json();
};

const deleteCustomEntity = async (id: string): Promise<void> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-entities/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete custom entity");
  }
};

export const useCustomEntityTypes = () => {
  return useQuery({
    queryKey: ["custom-entity-types"],
    queryFn: fetchCustomEntityTypes,
  });
};

export const useCustomFieldSchema = (slug: string) => {
  const query = useCustomEntityTypes();
  const type = (query.data || []).find((item) => item.slug === slug) || null;

  return {
    ...query,
    type,
    fieldSchema: getCustomEntityTypeFields(type),
  };
};

export const useCreateCustomEntityType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomEntityType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-entity-types"] });
    },
  });
};

export const useUpdateCustomEntityType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertCustomEntityTypePayload }) =>
      updateCustomEntityType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-entity-types"] });
      queryClient.invalidateQueries({ queryKey: ["custom-entities"] });
    },
  });
};

export const useDeleteCustomEntityType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomEntityType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-entity-types"] });
      queryClient.invalidateQueries({ queryKey: ["custom-entities"] });
    },
  });
};

export const useCustomEntitiesByType = (typeId: string) => {
  return useQuery({
    queryKey: ["custom-entities", typeId],
    queryFn: () => fetchCustomEntitiesByType(typeId),
    enabled: !!typeId,
  });
};

export const useCreateCustomEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomEntity,
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ["custom-entities", payload.type_id] });
      queryClient.invalidateQueries({ queryKey: ["custom-entity-types"] });
    },
  });
};

export const useUpdateCustomEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertCustomEntityPayload }) =>
      updateCustomEntity(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-entities", variables.payload.type_id] });
    },
  });
};

export const useDeleteCustomEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string; typeId: string }) =>
      deleteCustomEntity(variables.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-entities", variables.typeId] });
    },
  });
};
