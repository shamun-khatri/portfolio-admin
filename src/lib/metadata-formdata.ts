export const parseMetadataJson = (metadataJson?: string): Record<string, unknown> => {
  if (!metadataJson || !metadataJson.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(metadataJson);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error("Metadata must be a JSON object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error("Metadata must be valid JSON object");
  }
};

export const appendMetadataToFormData = (
  formData: FormData,
  metadata?: Record<string, unknown>
) => {
  if (!metadata) {
    return;
  }

  Object.entries(metadata).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    const metadataKey = `metadata.${key}`;

    if (value instanceof File) {
      formData.append(metadataKey, value);
      return;
    }

    if (Array.isArray(value) && value.length > 0 && value.every((item) => item instanceof File)) {
      value.forEach((file) => formData.append(metadataKey, file));
      return;
    }

    if (typeof value === "object") {
      formData.append(metadataKey, JSON.stringify(value));
      return;
    }

    formData.append(metadataKey, String(value));
  });
};
