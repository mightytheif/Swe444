import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (url: string) => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  let storage;
  try {
    storage = getStorage(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Storage:", error);
    toast({
      title: "Storage Error",
      description: "Failed to initialize storage. Please try again later.",
      variant: "destructive",
    });
  }

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, JPEG, PNG, or GIF image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!storage) {
        throw new Error("Storage not initialized");
      }

      setIsUploading(true);
      console.log('Starting upload process...');

      // Create a unique file path with timestamp and file name
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `property-images/${fileName}`);

      console.log('Uploading file:', fileName);
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('Upload completed:', uploadResult);

      if (!uploadResult) {
        throw new Error("Upload failed - no upload result returned");
      }

      console.log('Getting download URL...');
      const url = await getDownloadURL(uploadResult.ref);
      console.log('Got download URL:', url);

      if (!url) {
        throw new Error("Failed to get download URL");
      }

      // Update the form
      onChange([...value, url]);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      let errorMessage = "Failed to upload image. Please try again.";

      if (error.code === 'storage/unauthorized') {
        errorMessage = "Permission denied. Please check your Firebase Storage rules.";
      } else if (error.code === 'storage/canceled') {
        errorMessage = "Upload was canceled.";
      } else if (error.code === 'storage/unknown') {
        errorMessage = "An unknown error occurred. Please try again.";
      } else if (error.message === "Storage not initialized") {
        errorMessage = "Storage service is not available. Please try again later.";
      }

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input value to allow uploading the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [value, onChange, toast, storage]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square">
            <img
              src={url}
              alt="Property"
              className="object-cover w-full h-full rounded-lg"
            />
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              "Upload Image"
            )}
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Supported formats: JPG, JPEG, PNG, GIF. Maximum size: 5MB per image.
          For best quality, use images at least 800x600 pixels.
        </p>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@replit/extensions";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const files = Array.from(e.target.files);
      const uploadedUrls: string[] = [];
      
      const client = new Client();
      const storage = client.storage;
      
      for (const file of files) {
        // Generate a unique file name to avoid collisions
        const fileName = `${Date.now()}-${file.name}`;
        
        // Upload file to Replit Object Storage
        await storage.storeFile(fileName, file);
        
        // Get the public URL
        const url = await storage.getPublicURL(fileName);
        uploadedUrls.push(url);
      }
      
      onChange([...value, ...uploadedUrls]);
      
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-md overflow-hidden">
            <img 
              src={url} 
              alt="Property image"
              className="object-cover w-full h-full"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => onRemove(url)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <Button
          type="button"
          variant="secondary"
          disabled={isUploading}
          className="relative"
        >
          {isUploading ? "Uploading..." : "Upload Images"}
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onUpload}
            accept="image/*"
            multiple
            disabled={isUploading}
          />
        </Button>
      </div>
    </div>
  );
}
