import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

type ImageUploadProps = {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
};

export function ImageUpload({ 
  onUpload, 
  onRemove, 
  currentImageUrl, 
  disabled = false 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

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
      const storageRef = ref(storage, fileName);

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

  return (
    <div className="w-full">
      {previewUrl ? (
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
import { useState } from "react";
import { Button } from "./button";
import { Loader2, X } from "lucide-react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
      const storage = getStorage();
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `property-images/${timestamp}_${file.name}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error("Upload error:", error);
          toast({
            title: "Upload failed",
            description: "There was a problem uploading your image",
            variant: "destructive",
          });
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onUpload(downloadURL);
          setIsUploading(false);
          toast({
            title: "Upload complete",
            description: "Your image has been uploaded successfully",
          });
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  if (currentImageUrl) {
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

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Uploading... {uploadProgress}%
          </p>
        </div>
      ) : (
        <div className="py-4">
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="p-4 bg-muted rounded-full mb-2">
              <svg
                className="w-6 h-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium">Click to upload an image</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG or WEBP (max 5MB)
            </p>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled}
            />
          </label>
        </div>
      )}
    </div>
  );
}
