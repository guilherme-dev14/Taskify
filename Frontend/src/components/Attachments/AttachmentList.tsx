import { useState } from "react";
import {
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attachmentService } from "../../services/Attachments/attachment.service";
import type {
  IAttachment,
  IAttachmentFilters,
} from "../../types/attachment.types";
import { formatDate } from "../../utils/dateUtils";
import { FileUploadModal } from "../Modals/FileUploadModal";

interface AttachmentListProps {
  taskId?: string;
  workspaceId?: string;
  onPreview?: (attachment: IAttachment) => void;
  className?: string;
}

export function AttachmentList({
  taskId,
  workspaceId,
  onPreview,
  className = "",
}: AttachmentListProps) {
  const [filters, setFilters] = useState<IAttachmentFilters>({
    taskId,
    workspaceId,
    page: 0,
    size: 20,
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: attachments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attachments", filters],
    queryFn: () => attachmentService.getAttachments(filters),
    enabled: !!(taskId || workspaceId),
  });

  const deleteMutation = useMutation({
    mutationFn: attachmentService.deleteAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
    },
  });

  const handlePreview = (attachment: IAttachment) => {
    if (attachmentService.isPreviewable(attachment.mimeType)) {
      onPreview?.(attachment);
    }
  };

  const handleDelete = (attachmentId: string) => {
    if (window.confirm("Are you sure you want to delete this attachment?")) {
      deleteMutation.mutate(attachmentId);
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-lg">
              <div className="h-10 w-10 bg-gray-300 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <DocumentIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Failed to load attachments</p>
      </div>
    );
  }

  if (!attachments?.content.length) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <DocumentIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No attachments yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Upload Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Attachments ({attachments.content.length})
        </h3>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Upload File
        </button>
      </div>

      {attachments?.content.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* File Icon/Thumbnail */}
          <div className="flex-shrink-0">
            {attachment.filePath ? (
              <img
                src={attachment.filePath}
                alt={attachment.originalName}
                className="h-10 w-10 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.removeAttribute("style");
                }}
              />
            ) : null}
            <div
              className={`h-10 w-10 flex items-center justify-center text-2xl ${
                attachment.filePath ? "hidden" : ""
              }`}
            >
              {attachmentService.getFileTypeIcon(attachment.mimeType)}
            </div>
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <a
              href={attachment.filePath}
              target="_blank"
              rel="noopener noreferrer"
              download={attachment.originalName}
              className="text-sm font-medium text-gray-900 truncate hover:text-blue-600"
            >
              {attachment.originalName}
            </a>

            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <UserIcon className="h-3 w-3" />
                <span>
                  {attachment.uploadedBy.firstName}{" "}
                  {attachment.uploadedBy.lastName}
                </span>
              </span>

              <span className="flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                <span>{formatDate(attachment.uploadedAt)}</span>
              </span>

              <span>{attachmentService.formatFileSize(attachment.size)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {attachmentService.isPreviewable(attachment.mimeType) && (
              <button
                onClick={() => handlePreview(attachment)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Preview"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            )}

            {/* O botão de download agora é um link direto */}
            <a
              href={attachment.filePath}
              target="_blank"
              rel="noopener noreferrer"
              download={attachment.originalName}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </a>

            <button
              onClick={() => handleDelete(attachment.id)}
              disabled={deleteMutation.isPending}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Load More */}
      {!attachments.last && (
        <div className="text-center py-4">
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Load more attachments
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Attachment"
        maxFiles={10}
        maxSize={50}
        uploadType="attachment"
        workspaceId={workspaceId ? Number(workspaceId) : undefined}
        taskId={taskId ? Number(taskId) : undefined}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ["attachments"] });
        }}
      />
    </div>
  );
}
