import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Bio,
  BioFormData,
} from "../components/forms/form-schemas/bio-schema";

const toFormData = (data: BioFormData, isUpdate: boolean = false): FormData => {
  const formData = new FormData();

  // Handle basic fields
  formData.append("name", data.name);
  formData.append("designations", JSON.stringify(data.designations));
  formData.append("desc", data.desc);

  // Handle resume URL - always send it, even if empty
  formData.append("resumeUrl", data.resumeUrl || "");

  // Handle profile image file - only append if a new file is selected
  if (data.profileImage && data.profileImage.length > 0) {
    const file = data.profileImage[0];
    if (file instanceof File) {
      formData.append("profileImage", file);
    }
  } else if (isUpdate) {
    // For updates, explicitly indicate no image change if no file provided
    // Don't append profileImage field at all to keep existing image
  }

  return formData;
};

const fetchBio = async (userId: string): Promise<Bio | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bio/${userId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch bio");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching bio:", error);
    return null;
  }
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
  const formData = toFormData(data, true); // Pass true for isUpdate
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bio`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to update bio");
  }
  return response.json();
};

export const useBio = (userId: string) => {
  return useQuery({
    queryKey: ["bio", userId],
    queryFn: () => fetchBio(userId),
    enabled: !!userId,
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
