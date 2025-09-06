import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Skill,
  SkillFormData,
  GroupedSkills,
} from "../components/forms/form-schemas/skill-schema";

const toFormData = (data: SkillFormData): FormData => {
  const formData = new FormData();

  // Handle basic fields
  formData.append("name", data.name);
  formData.append("category", data.category);

  // Handle icon file
  if (data.icon && data.icon.length > 0) {
    const file = data.icon[0];
    if (file instanceof File) {
      formData.append("icon", file);
    }
  }

  return formData;
};

// Fetch all skills
const fetchSkills = async (): Promise<Skill[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/skills/111316734788280692226`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch skills");
  }
  return response.json();
};

// Fetch grouped skills
const fetchGroupedSkills = async (): Promise<GroupedSkills> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/skills/111316734788280692226/grouped`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch grouped skills");
  }
  return response.json();
};

// Fetch single skill
const fetchSkill = async (userId: string, id: string): Promise<Skill> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/skills/${userId}/${id}`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch skill");
  }
  return response.json();
};

// Create skill
const createSkill = async (data: SkillFormData): Promise<Skill> => {
  const formData = toFormData(data);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to create skill");
  }
  return response.json();
};

// Update skill
const updateSkill = async (id: string, data: SkillFormData): Promise<Skill> => {
  const formData = toFormData(data);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/skills/${id}`,
    {
      method: "PUT",
      credentials: "include",
      body: formData,
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update skill");
  }
  return response.json();
};

// Delete skill
const deleteSkill = async (id: string): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/skills/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete skill");
  }
};

// Hooks
export const useSkills = () => {
  return useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: fetchSkills,
  });
};

export const useGroupedSkills = () => {
  return useQuery<GroupedSkills>({
    queryKey: ["skills", "grouped"],
    queryFn: fetchGroupedSkills,
  });
};

export const useSkill = (userId: string, id: string) => {
  return useQuery<Skill>({
    queryKey: ["skills", id],
    queryFn: () => fetchSkill(userId, id),
    enabled: !!id,
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
};

export const useUpdateSkill = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SkillFormData) => updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills", id] });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
};
