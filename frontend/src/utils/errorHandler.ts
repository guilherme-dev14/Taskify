export interface ErrorInfo {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export const getErrorInfo = (error: any): ErrorInfo => {
  // Default error
  let errorInfo: ErrorInfo = {
    title: 'Oops! Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
    type: 'error'
  };

  // Check if error has response (axios error)
  if (error?.response?.data) {
    const { status, data } = error.response;
    const errorMessage = data.message || data.error || data.detail || '';

    switch (status) {
      case 400:
        if (errorMessage.toLowerCase().includes('already exists') || 
            errorMessage.toLowerCase().includes('duplicate') ||
            errorMessage.toLowerCase().includes('já existe')) {
          errorInfo = {
            title: 'Duplicate Entry',
            message: 'A task with this title already exists in this workspace. Please choose a different title.',
            type: 'warning'
          };
        } else if (errorMessage.toLowerCase().includes('invalid') ||
                   errorMessage.toLowerCase().includes('required')) {
          errorInfo = {
            title: 'Invalid Information',
            message: 'Please check the information provided and try again.',
            type: 'warning'
          };
        } else {
          errorInfo = {
            title: 'Invalid Request',
            message: errorMessage || 'The information provided is not valid. Please review and try again.',
            type: 'warning'
          };
        }
        break;

      case 401:
        errorInfo = {
          title: 'Authentication Required',
          message: 'Please log in to continue.',
          type: 'warning'
        };
        break;

      case 403:
        errorInfo = {
          title: 'Access Denied',
          message: 'You don\'t have permission to perform this action.',
          type: 'error'
        };
        break;

      case 404:
        errorInfo = {
          title: 'Not Found',
          message: 'The requested item could not be found. It may have been deleted.',
          type: 'info'
        };
        break;

      case 409:
        if (errorMessage.toLowerCase().includes('conflict') ||
            errorMessage.toLowerCase().includes('already exists')) {
          errorInfo = {
            title: 'Conflict Detected',
            message: 'This item already exists. Please use a different name or check existing items.',
            type: 'warning'
          };
        } else {
          errorInfo = {
            title: 'Conflict',
            message: errorMessage || 'There was a conflict with your request. Please try again.',
            type: 'warning'
          };
        }
        break;

      case 422:
        errorInfo = {
          title: 'Validation Error',
          message: errorMessage || 'The information provided failed validation. Please check your input.',
          type: 'warning'
        };
        break;

      case 429:
        errorInfo = {
          title: 'Too Many Requests',
          message: 'You\'re making too many requests. Please wait a moment and try again.',
          type: 'warning'
        };
        break;

      case 500:
        errorInfo = {
          title: 'Server Error',
          message: 'Our server encountered an issue. Please try again in a few moments.',
          type: 'error'
        };
        break;

      case 503:
        errorInfo = {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again later.',
          type: 'error'
        };
        break;

      default:
        errorInfo = {
          title: 'Unexpected Error',
          message: errorMessage || `An error occurred (${status}). Please try again.`,
          type: 'error'
        };
    }
  } 
  // Network errors
  else if (error?.message === 'Network Error' || !navigator.onLine) {
    errorInfo = {
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
      type: 'warning'
    };
  }
  // Timeout errors
  else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    errorInfo = {
      title: 'Request Timeout',
      message: 'The request took too long. Please try again.',
      type: 'warning'
    };
  }
  // Generic error with message
  else if (error?.message) {
    errorInfo = {
      title: 'Error',
      message: error.message,
      type: 'error'
    };
  }

  return errorInfo;
};

// Helper function to get error message for different operations
export const getOperationErrorInfo = (operation: string, error: any): ErrorInfo => {
  const baseError = getErrorInfo(error);
  
  const operationTitles: Record<string, string> = {
    'create': 'Failed to Create',
    'update': 'Failed to Update',
    'delete': 'Failed to Delete',
    'load': 'Failed to Load',
    'save': 'Failed to Save'
  };

  return {
    ...baseError,
    title: operationTitles[operation] || baseError.title
  };
};