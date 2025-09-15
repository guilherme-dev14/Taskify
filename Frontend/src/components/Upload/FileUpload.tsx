import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../hooks/useToast";
import fileService from "../../services/File/file.service";

export interface UploadedFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  url?: string;
  error?: string;
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload?: (files: UploadedFile[]) => void;
  onRemove?: (fileId: string) => void;
  className?: string;
  disabled?: boolean;
  uploadType?: "attachment" | "avatar";
  workspaceId?: number;
  taskId?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = "*/*",
  maxSize = 10,
  maxFiles = 5,
  onUpload,
  onRemove,
  className = "",
  disabled = false,
  uploadType = "attachment",
  workspaceId,
  taskId,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const mimeType = file.type.toLowerCase();

      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension === type;
        }
        if (type.includes("*")) {
          const baseType = type.split("/")[0];
          return mimeType.startsWith(baseType);
        }
        return mimeType === type;
      });

      if (!isValidType) {
        return `File type not accepted. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "uploading", progress: 0 }
            : f
        )
      );

      let response;
      if (uploadType === "avatar") {
        response = await fileService.uploadAvatar(uploadedFile.file);
      } else {
        response = await fileService.uploadAttachment(uploadedFile.file, {
          workspaceId,
          taskId,
        });
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                url: response.url || response.path,
              }
            : f
        )
      );

      toast.success("File uploaded successfully", uploadedFile.name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "error", error: errorMessage }
            : f
        )
      );

      toast.error("Upload failed", errorMessage);
    }
  };

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const filesArray = Array.from(fileList);

      if (files.length + filesArray.length > maxFiles) {
        toast.warning("Too many files", `Maximum ${maxFiles} files allowed`);
        return;
      }

      const newFiles: UploadedFile[] = [];

      for (const file of filesArray) {
        const validationError = validateFile(file);
        if (validationError) {
          toast.error("Invalid file", validationError);
          continue;
        }

        const uploadedFile: UploadedFile = {
          file,
          id: generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "pending",
        };

        newFiles.push(uploadedFile);
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        onUpload?.(newFiles);

        // Start uploading files
        for (const file of newFiles) {
          await uploadFile(file);
        }
      }
    },
    [files.length, maxFiles, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    },
    [processFiles, disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
        e.target.value = ""; // Reset input
      }
    },
    [processFiles]
  );

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    onRemove?.(fileId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return PhotoIcon;
    return DocumentIcon;
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "error":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${
            isDragOver
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-4">
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragOver ? "Drop files here" : "Upload files"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Max {maxFiles} files, {maxSize}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      <AnimatePresence>
        {files.map((file) => {
          const FileIconComponent = getFileIcon(file.type);
          
          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <FileIconComponent className="w-8 h-8 text-gray-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
                
                {file.status === "uploading" && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
                
                {file.status === "error" && (
                  <p className="text-xs text-red-500 mt-1">{file.error}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusIcon(file.status)}
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;