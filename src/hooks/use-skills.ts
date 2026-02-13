import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Skill,
  SkillFormData,
  GroupedSkills,
} from "../components/forms/form-schemas/skill-schema";
import { appendMetadataToFormData, parseMetadataJson } from "@/lib/metadata-formdata";

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

  appendMetadataToFormData(formData, parseMetadataJson(data.metadataJson));

  return formData;
};

const groupSkillsByCategory = (skills: Skill[]): GroupedSkills => {
  return skills.reduce<GroupedSkills>((acc, skill) => {
    const category = skill.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});
};

// Fetch all skills
const fetchSkills = async (userId: string): Promise<Skill[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/skills/${userId}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch skills");
  }
  return response.json();
};

// Fetch grouped skills
const fetchGroupedSkills = async (userId: string): Promise<GroupedSkills> => {
  const skills = await fetchSkills(userId);
  return groupSkillsByCategory(skills);
};

// Fetch single skill
const fetchSkill = async (userId: string, id: string): Promise<Skill> => {
  const skills = await fetchSkills(userId);
  const skill = skills.find((item) => item.id === id);

  if (!skill) {
    throw new Error("Skill not found");
  }

  return skill;
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
export const useSkills = (userId: string) => {
  return useQuery<Skill[]>({
    queryKey: ["skills", userId],
    queryFn: () => fetchSkills(userId),
    enabled: !!userId,
  });
};

export const useGroupedSkills = (userId: string) => {
  return useQuery<GroupedSkills>({
    queryKey: ["skills", "grouped", userId],
    queryFn: () => fetchGroupedSkills(userId),
    enabled: !!userId,
  });
};

export const useSkill = (userId: string, id: string) => {
  return useQuery<Skill>({
    queryKey: ["skills", id],
    queryFn: () => fetchSkill(userId, id),
    enabled: !!id && !!userId,
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
