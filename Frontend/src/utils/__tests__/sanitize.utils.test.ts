import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  sanitizeString,
  validateEmail,
  validatePassword,
  validateUsername,
  validateFileName,
  validateFileSize,
  validateFileType,
  getPasswordValidationError,
  getEmailValidationError,
  getUsernameValidationError,
} from '../sanitize.utils'

describe('sanitize.utils', () => {
  describe('sanitizeHtml', () => {
    it('should remove dangerous HTML tags', () => {
      const input = '<script>alert("xss")</script><p>Safe content</p>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>Safe content</p>')
    })

    it('should allow safe HTML tags', () => {
      const input = '<b>Bold</b> and <em>emphasized</em> text'
      const result = sanitizeHtml(input)
      expect(result).toBe('<b>Bold</b> and <em>emphasized</em> text')
    })

    it('should handle null/undefined input', () => {
      expect(sanitizeHtml(null)).toBe('')
      expect(sanitizeHtml(undefined)).toBe('')
      expect(sanitizeHtml('')).toBe('')
    })
  })

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeString(input)
      expect(result).toBe('scriptalert(xss)/script')
    })

    it('should trim whitespace', () => {
      const input = '  normal text  '
      const result = sanitizeString(input)
      expect(result).toBe('normal text')
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123')).toBe(true)
      expect(validatePassword('MySecure1')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false) // too short
      expect(validatePassword('weakpassword')).toBe(false) // no uppercase or digit
      expect(validatePassword('WEAKPASSWORD')).toBe(false) // no lowercase or digit
      expect(validatePassword('WeakPassword')).toBe(false) // no digit
    })
  })

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      expect(validateUsername('user123')).toBe(true)
      expect(validateUsername('test_user')).toBe(true)
      expect(validateUsername('user-name')).toBe(true)
    })

    it('should reject invalid usernames', () => {
      expect(validateUsername('ab')).toBe(false) // too short
      expect(validateUsername('a'.repeat(25))).toBe(false) // too long
      expect(validateUsername('user@name')).toBe(false) // invalid characters
    })
  })

  describe('validateFileName', () => {
    it('should validate safe filenames', () => {
      expect(validateFileName('document.pdf')).toBe(true)
      expect(validateFileName('image_01.jpg')).toBe(true)
    })

    it('should reject dangerous filenames', () => {
      expect(validateFileName('.htaccess')).toBe(false)
      expect(validateFileName('file../../../etc/passwd')).toBe(false)
      expect(validateFileName('file with spaces')).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('should validate acceptable file sizes', () => {
      expect(validateFileSize(1024)).toBe(true) // 1KB
      expect(validateFileSize(10 * 1024 * 1024)).toBe(true) // 10MB
    })

    it('should reject invalid file sizes', () => {
      expect(validateFileSize(0)).toBe(false)
      expect(validateFileSize(100 * 1024 * 1024)).toBe(false) // 100MB
    })
  })

  describe('validateFileType', () => {
    it('should validate allowed file types', () => {
      expect(validateFileType('image/jpeg')).toBe(true)
      expect(validateFileType('application/pdf')).toBe(true)
    })

    it('should reject disallowed file types', () => {
      expect(validateFileType('application/x-executable')).toBe(false)
      expect(validateFileType('text/html')).toBe(false)
    })
  })

  describe('validation error messages', () => {
    it('should return appropriate password error messages', () => {
      expect(getPasswordValidationError('short')).toContain('8 characters')
      expect(getPasswordValidationError('nouppercase1')).toContain('uppercase')
      expect(getPasswordValidationError('NOLOWERCASE1')).toContain('lowercase')
      expect(getPasswordValidationError('NoNumbers')).toContain('number')
      expect(getPasswordValidationError('ValidPass123')).toBeNull()
    })

    it('should return email error messages', () => {
      expect(getEmailValidationError('invalid')).toContain('valid email')
      expect(getEmailValidationError('test@example.com')).toBeNull()
    })

    it('should return username error messages', () => {
      expect(getUsernameValidationError('ab')).toContain('3-20 characters')
      expect(getUsernameValidationError('valid_user')).toBeNull()
    })
  })
})