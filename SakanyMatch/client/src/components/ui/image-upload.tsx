import { useState, useCallback } from "react";
import { Button } from "./button";
import { Loader2, X, ImagePlus } from "lucide-react";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onUpload,
  onRemove,
  currentImageUrl,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file name with timestamp
      const fileName = `property-images/${Date.now()}-${file.name}`;
      const storageRef = ref(getStorage(), fileName);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Set preview and call onUpload callback
      setPreviewUrl(downloadUrl);
      onUpload(downloadUrl);

      toast({
        title: "Image uploaded",
        description: "The image has been uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should not exceed 5MB');
      }

      // Create a unique file name with timestamp
      const fileName = `property-images/${Date.now()}-${file.name}`;
      const storageRef = ref(getStorage(), fileName);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Set preview and call onUpload callback
      setPreviewUrl(downloadUrl);
      onUpload(downloadUrl);

      toast({
        title: "Image uploaded",
        description: "The image has been uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, toast]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    if (onRemove) onRemove();
  }, [onRemove]);

  if (currentImageUrl && previewUrl === null) {
    return (
      <div className="relative rounded-md overflow-hidden border border-border aspect-square">
        <img
          src={currentImageUrl}
          alt="Property image"
          className="w-full h-full object-cover"
        />
        {onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={onRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className="relative rounded-md overflow-hidden border border-border">
        <img
          src={previewUrl}
          alt="Property"
          className="w-full h-48 object-cover"
        />
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2"
          onClick={handleRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Uploading... {uploadProgress}%
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-md">
          <div className="mb-2">
            <ImagePlus className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Click to upload an image
          </p>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading || disabled}
              className="relative"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Select Image"
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
                disabled={isUploading || disabled}
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}