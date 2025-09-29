import api from "../api";
import type {
  IAttachment,
  IAttachmentFilters,
  IAttachmentsResponse,
  IUploadAttachmentRequest,
} from "../../types/attachment.types";

export const attachmentService = {
  uploadAttachment: async (
    request: IUploadAttachmentRequest,
    onProgress?: (progress: number) => void
  ): Promise<IAttachment> => {
    const formData = new FormData();
    formData.append("file", request.file);
    if (request.description) {
      formData.append("description", request.description);
    }

    const response = await api.post(
      `/tasks/${request.taskId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  },

  getAttachments: async (
    filters: IAttachmentFilters
  ): Promise<IAttachmentsResponse> => {
    if (!filters.taskId) {
      return {
        content: [],
        totalElements: 0,
        page: 0,
        totalPages: 0,
        size: 0,
        first: true,
        last: true,
        empty: true,
      };
    }
    const response = await api.get(`/tasks/${filters.taskId}/attachments`);

    const data = response.data;
    if (Array.isArray(data)) {
      return {
        content: data,
        totalElements: data.length,
        page: 0,
        totalPages: 1,
        size: data.length,
        first: true,
        last: true,
        empty: data.length === 0,
      };
    }
    return data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await api.delete(`/attachments/${attachmentId}`);
  },

  isPreviewable: (mimeType: string): boolean => {
    const previewableTypes = [
      "image/",
      "application/pdf",
      "text/",
      "application/json",
      "application/javascript",
      "application/typescript",
    ];
    return previewableTypes.some((type) => mimeType.startsWith(type));
  },

  getFileTypeIcon: (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "📽️";
    if (
      mimeType.includes("zip") ||
      mimeType.includes("rar") ||
      mimeType.includes("archive")
    )
      return "📦";
    if (mimeType.startsWith("text/")) return "📋";
    return "📄";
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  },
};
