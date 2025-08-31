import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Bio,
  BioFormData,
} from "../components/forms/form-schemas/bio-schema";

const toFormData = (
  data: BioFormData
): FormData => {
  const formData = new FormData();

  // Handle basic fields
  formData.append("name", data.name);
  formData.append("designations", JSON.stringify(data.designations));
  formData.append("desc", data.desc);
  
  if (data.resumeUrl && data.resumeUrl.trim() !== "") {
    formData.append("resumeUrl", data.resumeUrl);
  }
  
  // Handle profile image file
  if (data.profileImage && data.profileImage.length > 0) {
    const file = data.profileImage[0];
    if (file instanceof File) {
      formData.append("profileImage", file);
    }
  }

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
  const formData = toFormData(data);
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
