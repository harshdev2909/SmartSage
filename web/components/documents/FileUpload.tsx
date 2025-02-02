"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  bucketName: string;
}

export default function FileUpload({
  onUploadComplete,
  bucketName,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      const file = acceptedFiles[0];

      try {
        // Check file type
        if (!file.type.includes("pdf")) {
          throw new Error("Only PDF files are allowed");
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File size must be less than 10MB");
        }

        // Generate a unique file name
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}-${file.name}`;

        // Upload file to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(fileName);

        onUploadComplete(publicUrl);

        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to upload file",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [supabase, bucketName, onUploadComplete, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        transition-all duration-200 ease-in-out
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? "Drop the PDF file here"
                  : "Drag and drop a PDF file here, or click to select"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                PDF files only, up to 10MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
