export interface IAttachment {
  id: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface IUploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

export interface IAttachmentFilters {
  taskId?: string;
  workspaceId?: string;
  mimeType?: string;
  uploadedBy?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  size: number;
}

export interface IAttachmentsResponse {
  content: IAttachment[];
  totalElements: number;
  page: number;
  totalPages: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface IUploadAttachmentRequest {
  file: File;
  taskId: string;
  description?: string;
}
