import { useCallback } from 'react';
import { toast } from 'react-toastify';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    logToConsole = true,
    fallbackMessage = 'An unexpected error occurred'
  } = options;

  const handleError = useCallback((error: Error | unknown, context?: string) => {
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = fallbackMessage;
    }

    // Log to console in development
    if (logToConsole && process.env.NODE_ENV === 'development') {
      console.error('Error caught by useErrorHandler:', {
        error,
        context,
        timestamp: new Date().toISOString()
      });
    }

    // Show toast notification
    if (showToast) {
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to logging service
      // logErrorToService(error, context);
    }
  }, [showToast, logToConsole, fallbackMessage]);

  const handleAsyncError = useCallback(async (asyncFn: () => Promise<any>, context?: string) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw so the caller can handle it if needed
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};