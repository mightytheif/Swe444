import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  onUpload,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const storage = getStorage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    uploadImage(file);
  };

  const uploadImage = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `property-images/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your image",
          variant: "destructive",
        });
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onUpload(downloadURL);
          setIsUploading(false);
          toast({
            title: "Upload successful",
            description: "Image has been uploaded successfully",
          });
        });
      }
    );
  };

  return (
    <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 h-full ${className}`}>
      <input
        type="file"
        accept="image/*"
        id="image-upload"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <div className="text-sm font-medium">Uploading...</div>
            <div className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</div>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center cursor-pointer gap-2"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <div className="text-sm font-medium">Click to upload</div>
            <div className="text-xs text-muted-foreground">
              JPG, PNG, GIF (max 5MB)
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            className="mt-2"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            Select Image
          </Button>
        </label>
      )}
    </div>
  );
}