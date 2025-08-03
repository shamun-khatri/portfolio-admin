import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/use-image-upload";

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
}

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ImageUpload = ({ onFileChange }: ImageUploadProps) => {
  const {
    dragActive,
    preview,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeFile,
  } = useImageUpload();

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(e) => handleDrop(e, onFileChange)}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag & drop a file here, or click to select
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WEBP up to 5MB
        </p>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileChange(file, onFileChange);
            }
          }}
        />
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => removeFile(onFileChange)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
