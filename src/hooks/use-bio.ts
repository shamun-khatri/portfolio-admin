import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Bio,
  BioFormData,
} from "../components/forms/form-schemas/bio-schema";

const toFormData = (
  data: Record<string, string | string[] | File | undefined>
): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Handle arrays (e.g., tags)
      formData.append(key, JSON.stringify(value));
    } else if (value instanceof File) {
      // Handle file uploads
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      // Handle other fields
      formData.append(key, value);
    }
  });

  return formData;
};

const fetchBio = async (): Promise<Bio | null> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/bio/111316734788280692226`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch bio");
  }
  return response.json();
};

const createBio = async (data: BioFormData): Promise<Bio | null> => {
  const formData = toFormData(data);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bio`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to create bio");
  }
  return response.json();
};

const updateBio = async (data: BioFormData): Promise<Bio | null> => {
  const response = await fetch("/api/bio", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update bio");
  }
  return response.json();
};

export const useBio = () => {
  return useQuery({
    queryKey: ["bio"],
    queryFn: fetchBio,
  });
};

export const useCreateBio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio"] });
    },
  });
};

export const useUpdateBio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio"] });
    },
  });
};
