import { useState } from "react";

export const useImageUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    onFileChange: (file: File | null) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file, onFileChange);
    }
  };

  const handleFileChange = (
    file: File,
    onFileChange: (file: File | null) => void
  ) => {
    onFileChange(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (onFileChange: (file: File | null) => void) => {
    onFileChange(null);
    setPreview(null);
  };

  return {
    dragActive,
    preview,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeFile,
  };
};
