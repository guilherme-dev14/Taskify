import React, { useRef, useState, useCallback } from "react";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attachmentService } from "../../services/Attachments/attachment.service";
import type {
  IAttachment,
  IUploadProgress,
} from "../../types/attachment.types";

interface FileUploadProps {
  taskId?: string;
  workspaceId?: string;
  onUploadComplete?: (attachments: IAttachment[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function FileUpload({
  taskId,
  workspaceId,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = [],
  className = "",
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<IUploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadPromises = files.map(async (file) => {
        const uploadId = Date.now() + Math.random();

        setUploads((prev) => [
          ...prev,
          {
            id: uploadId.toString(),
            filename: file.name,
            progress: 0,
            status: "uploading",
          },
        ]);

        try {
          const attachment = await attachmentService.uploadAttachment(
            { file, taskId, workspaceId },
            (progress) => {
              setUploads((prev) =>
                prev.map((upload) =>
                  upload.id === uploadId.toString()
                    ? { ...upload, progress }
                    : upload
                )
              );
            }
          );

          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === uploadId.toString()
                ? { ...upload, progress: 100, status: "completed" as const }
                : upload
            )
          );

          return attachment;
        } catch (error) {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === uploadId.toString()
                ? {
                    ...upload,
                    status: "error" as const,
                    error: "Upload failed",
                  }
                : upload
            )
          );
          throw error;
        }
      });

      return Promise.all(uploadPromises);
    },
    onSuccess: (attachments) => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      onUploadComplete?.(attachments);

      setTimeout(() => {
        setUploads([]);
      }, 2000);
    },
    onError: (error: unknown) => {
      onUploadError?.(error instanceof Error ? error.message : "Upload failed");
    },
  });

  const validateFiles = (
    files: File[]
  ): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return { valid, errors };
    }

    files.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(
          `${file.name} is too large (max ${attachmentService.formatFileSize(
            maxSize
          )})`
        );
        return;
      }

      if (
        acceptedTypes.length > 0 &&
        !acceptedTypes.some((type) => file.type.includes(type))
      ) {
        errors.push(`${file.name} file type not allowed`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const handleFiles = useCallback(
    (files: File[]) => {
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        onUploadError?.(errors.join(", "));
        return;
      }

      if (valid.length > 0) {
        uploadMutation.mutate(valid);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadMutation, onUploadError]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUpload = (uploadId: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== uploadId));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${uploadMutation.isPending ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {acceptedTypes.length > 0 && (
              <>
                Supported formats: {acceptedTypes.join(", ")}
                <br />
              </>
            )}
            Maximum file size: {attachmentService.formatFileSize(maxSize)}
            {maxFiles > 1 && <> • Up to {maxFiles} files</>}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploading files</h4>
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {upload.filename}
                </p>

                {upload.status === "uploading" && (
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(upload.progress)}% uploaded
                    </p>
                  </div>
                )}

                {upload.status === "completed" && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Upload completed
                  </p>
                )}

                {upload.status === "error" && (
                  <p className="text-xs text-red-600 mt-1">✗ {upload.error}</p>
                )}
              </div>

              <button
                onClick={() => removeUpload(upload.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
