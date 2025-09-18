const DEFAULT_LOCALE = "pt-BR";

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleDateString(DEFAULT_LOCALE, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export const formatDateTime = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleString(DEFAULT_LOCALE, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export const formatRelativeDate = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 7) {
      return formatDate(dateObj);
    } else if (diffInDays > 0) {
      return `${diffInDays} dia${diffInDays > 1 ? "s" : ""} atrás`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hora${diffInHours > 1 ? "s" : ""} atrás`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""} atrás`;
    } else {
      return "Agora mesmo";
    }
  } catch {
    return "";
  }
};

/**
 * Format date for input field (YYYY-MM-DD)
 */
export const formatDateForInput = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

/**
 * Format date to long format (e.g., "15 de dezembro de 2023")
 */
export const formatLongDate = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleDateString(DEFAULT_LOCALE, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const today = new Date();

    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
};

/**
 * Check if date is overdue
 */
export const isOverdue = (
  dueDate: Date | string | null | undefined
): boolean => {
  if (!dueDate) return false;

  try {
    const dateObj = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return dateObj.getTime() < today.getTime();
  } catch {
    return false;
  }
};
