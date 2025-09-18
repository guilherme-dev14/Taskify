export interface ErrorInfo {
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly type: ErrorInfo["type"];
  public readonly title: string;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    type: ErrorInfo["type"] = "error",
    title?: string,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.title = title || this.getDefaultTitle(type);
    this.code = code;
    this.details = details;
  }

  private getDefaultTitle(type: ErrorInfo["type"]): string {
    switch (type) {
      case "error":
        return "Error";
      case "warning":
        return "Warning";
      case "info":
        return "Information";
      default:
        return "Notification";
    }
  }

  public toErrorInfo(): ErrorInfo {
    return {
      type: this.type,
      title: this.title,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export const handleApiError = (error: unknown): ErrorInfo => {
  if (error instanceof AppError) {
    return error.toErrorInfo();
  }

  if (error instanceof Error) {
    return {
      type: "error",
      title: "Unexpected Error",
      message: error.message,
    };
  }

  return {
    type: "error",
    title: "Unknown Error",
    message: "An unknown error occurred",
  };
};

export const createErrorInfo = (
  message: string,
  type: ErrorInfo["type"] = "error",
  title?: string
): ErrorInfo => {
  return {
    type,
    title:
      title ||
      (type === "error"
        ? "Error"
        : type === "warning"
        ? "Warning"
        : "Information"),
    message,
  };
};

export const getOperationErrorInfo = (
  operation: "load" | "create" | "update" | "delete" | "save",
  error: unknown
): ErrorInfo => {
  const operationTitles = {
    load: "Failed to Load",
    create: "Failed to Create",
    update: "Failed to Update",
    delete: "Failed to Delete",
    save: "Failed to Save",
  };

  const operationMessages = {
    load: "Unable to load the requested data. Please try again.",
    create: "Unable to create the item. Please check your input and try again.",
    update: "Unable to update the item. Please try again.",
    delete: "Unable to delete the item. Please try again.",
    save: "Unable to save changes. Please try again.",
  };

  if (error instanceof AppError) {
    return {
      ...error.toErrorInfo(),
      title: operationTitles[operation],
    };
  }

  if (error instanceof Error) {
    return {
      type: "error",
      title: operationTitles[operation],
      message: error.message || operationMessages[operation],
    };
  }

  return {
    type: "error",
    title: operationTitles[operation],
    message: operationMessages[operation],
  };
};
