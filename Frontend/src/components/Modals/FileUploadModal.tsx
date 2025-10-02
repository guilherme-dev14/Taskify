import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import FileUpload, { type UploadedFile } from "../Upload/FileUpload";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  workspaceId?: number;
  taskId?: number;
  onComplete?: (files: UploadedFile[]) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  title = "Upload Files",
  accept = "*/*",
  maxSize = 10,
  maxFiles = 5,
  workspaceId,
  taskId,
  onComplete,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleUpload = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleRemove = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleClose = () => {
    if (uploadedFiles.some((f) => f.status === "completed")) {
      onComplete?.(uploadedFiles.filter((f) => f.status === "completed"));
    }
    setUploadedFiles([]);
    onClose();
  };

  const completedFiles = uploadedFiles.filter((f) => f.status === "completed");
  const hasCompletedFiles = completedFiles.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Upload files to attach to task
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                <FileUpload
                  accept={accept}
                  maxSize={maxSize}
                  maxFiles={maxFiles}
                  workspaceId={workspaceId}
                  taskId={taskId}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                />

                {hasCompletedFiles && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      ✅ {completedFiles.length} file
                      {completedFiles.length > 1 ? "s" : ""} uploaded
                      successfully
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                >
                  {hasCompletedFiles ? "Done" : "Cancel"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileUploadModal;
