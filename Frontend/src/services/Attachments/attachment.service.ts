import api from "../api";
import type {
  IAttachment,
  IAttachmentFilters,
  IAttachmentsResponse,
  IUploadAttachmentRequest,
  IAttachmentVersion,
} from "../../types/attachment.types";

export const attachmentService = {
  uploadAttachment: async (
    request: IUploadAttachmentRequest,
    onProgress?: (progress: number) => void
  ): Promise<IAttachment> => {
    const formData = new FormData();
    formData.append("file", request.file);

    if (request.taskId) formData.append("taskId", request.taskId);
    if (request.workspaceId)
      formData.append("workspaceId", request.workspaceId);
    if (request.description)
      formData.append("description", request.description);

    const response = await api.post("/attachments/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  uploadMultipleAttachments: async (
    files: File[],
    taskId?: string,
    workspaceId?: string,
    onProgress?: (filename: string, progress: number) => void
  ): Promise<IAttachment[]> => {
    const uploadPromises = files.map((file) =>
      attachmentService.uploadAttachment(
        { file, taskId, workspaceId },
        onProgress ? (progress) => onProgress(file.name, progress) : undefined
      )
    );

    return Promise.all(uploadPromises);
  },

  getAttachments: async (
    filters: IAttachmentFilters
  ): Promise<IAttachmentsResponse> => {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      size: filters.size.toString(),
    });

    if (filters.taskId) params.append("taskId", filters.taskId);
    if (filters.workspaceId) params.append("workspaceId", filters.workspaceId);
    if (filters.mimeType) params.append("mimeType", filters.mimeType);
    if (filters.uploadedBy) params.append("uploadedBy", filters.uploadedBy);
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);

    const response = await api.get(`/attachments?${params.toString()}`);
    return response.data;
  },
  getAttachment: async (attachmentId: string): Promise<IAttachment> => {
    const response = await api.get(`/attachments/${attachmentId}`);
    return response.data;
  },
  getAttachmentVersions: async (
    attachmentId: string
  ): Promise<IAttachmentVersion[]> => {
    const response = await api.get(`/attachments/${attachmentId}/versions`);
    return response.data;
  },

  uploadNewVersion: async (
    attachmentId: string,
    file: File,
    changelog?: string,
    onProgress?: (progress: number) => void
  ): Promise<IAttachment> => {
    const formData = new FormData();
    formData.append("file", file);
    if (changelog) formData.append("changelog", changelog);

    const response = await api.post(
      `/attachments/${attachmentId}/versions`,
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

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await api.delete(`/attachments/${attachmentId}`);
  },

  downloadAttachment: async (
    attachmentId: string,
    version?: number
  ): Promise<void> => {
    const url = version
      ? `/attachments/${attachmentId}/download?version=${version}`
      : `/attachments/${attachmentId}/download`;

    const response = await api.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    const contentDisposition = response.headers["content-disposition"];
    const filename = contentDisposition
      ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
      : "download";

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  getPreviewUrl: (attachmentId: string): string => {
    return `${api.defaults.baseURL}/attachments/${attachmentId}/preview`;
  },

  getThumbnailUrl: (
    attachmentId: string,
    size: "small" | "medium" | "large" = "medium"
  ): string => {
    return `${api.defaults.baseURL}/attachments/${attachmentId}/thumbnail?size=${size}`;
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
