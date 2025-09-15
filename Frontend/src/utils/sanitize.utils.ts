import DOMPurify from 'dompurify';

// XSS Prevention utilities
export const sanitizeHtml = (input: string | null | undefined): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
};

export const sanitizeString = (input: string | null | undefined): string => {
  if (!input) return '';
  return input
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .trim();
};

// Input validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateTaskTitle = (title: string): boolean => {
  return title.trim().length >= 1 && title.length <= 200;
};

export const validateTaskDescription = (description: string): boolean => {
  return description.length <= 5000;
};

// File validation
export const validateFileName = (filename: string): boolean => {
  const safeFilename = /^[a-zA-Z0-9._-]+$/;
  return (
    filename.length <= 255 &&
    safeFilename.test(filename) &&
    !filename.startsWith('.') &&
    !filename.includes('..')
  );
};

export const validateFileSize = (size: number): boolean => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  return size > 0 && size <= maxSize;
};

export const validateFileType = (type: string): boolean => {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return allowedTypes.includes(type);
};

// Error messages
export const getPasswordValidationError = (password: string): string | null => {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return null;
};

export const getEmailValidationError = (email: string): string | null => {
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return null;
};

export const getUsernameValidationError = (username: string): string | null => {
  if (!validateUsername(username)) {
    return 'Username must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores';
  }
  return null;
};