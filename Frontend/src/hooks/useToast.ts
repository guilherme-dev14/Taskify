import { useToastStore } from "../stores/toast.store";
import type { Toast } from "../components/Notifications/ToastNotifications";

export const useToast = () => {
  const { addToast, removeToast, clearAllToasts, updateToast, toasts } =
    useToastStore();

  const toast = {
    success: (
      title: string,
      message?: string,
      options?: Partial<Omit<Toast, "id" | "type" | "title" | "message">>
    ) => {
      addToast({
        type: "success",
        title,
        message,
        ...options,
      });
    },

    error: (
      title: string,
      message?: string,
      options?: Partial<Omit<Toast, "id" | "type" | "title" | "message">>
    ) => {
      addToast({
        type: "error",
        title,
        message,
        duration: options?.duration ?? 8000,
        ...options,
      });
    },

    warning: (
      title: string,
      message?: string,
      options?: Partial<Omit<Toast, "id" | "type" | "title" | "message">>
    ) => {
      addToast({
        type: "warning",
        title,
        message,
        ...options,
      });
    },

    info: (
      title: string,
      message?: string,
      options?: Partial<Omit<Toast, "id" | "type" | "title" | "message">>
    ) => {
      addToast({
        type: "info",
        title,
        message,
        ...options,
      });
    },

    custom: (toastData: Omit<Toast, "id">) => {
      addToast(toastData);
    },

    remove: removeToast,
    clear: clearAllToasts,
    update: updateToast,
  };

  return {
    toast,
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    updateToast,
  };
};
