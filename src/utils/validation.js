// Validation utilities for form fields (email, phone, password, etc.)

// Validates that a field has a non-empty value
export const required = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
};

/**
 * Email validator
 *
 * Uses RFC 5322 compliant regex pattern
 *
 * Reference: RFC 5322 - Internet Message Format
 * https://tools.ietf.org/html/rfc5322#section-3.4.1
 *
 * Time Complexity: O(n) where n = email length
 *
 * @param {string} value - Email to validate
 * @returns {boolean} True if valid email format
 */
export const email = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // RFC 5322 compliant regex
  // Covers most real-world email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

/**
 * Phone number validator
 *
 * Validates South African phone numbers (default)
 * Supports: +27XXXXXXXXX, 0XXXXXXXXX
 *
 * Reference: "South African Telephone Numbering" - Wikipedia
 *
 * @param {string} value - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const phone = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Remove spaces and dashes for validation
  const cleaned = value.replace(/[\s-]/g, '');

  // South African phone number formats:
  // +27XXXXXXXXX (11 chars)
  // 27XXXXXXXXX (11 chars)
  // 0XXXXXXXXX (10 chars)
  const phoneRegex = /^(\+27|27|0)[0-9]{9}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Minimum length validator
 *
 * Creates a validator function that checks minimum string length
 *
 * Higher-Order Function Pattern:
 * - Function that returns a function
 * - Useful for creating reusable validators
 *
 * @param {number} min - Minimum length required
 * @returns {Function} Validator function
 */
export const minLength = (min) => {
  return (value) => {
    if (!value || typeof value !== 'string') {
      return false;
    }

    return value.trim().length >= min;
  };
};

/**
 * Maximum length validator
 *
 * @param {number} max - Maximum length allowed
 * @returns {Function} Validator function
 */
export const maxLength = (max) => {
  return (value) => {
    if (!value || typeof value !== 'string') {
      return true; // Valid if empty (use required for emptiness check)
    }

    return value.trim().length <= max;
  };
};

/**
 * Password strength validator
 *
 * Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 *
 * Reference: OWASP Password Policy
 * https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 *
 * @param {string} value - Password to validate
 * @returns {boolean} True if password meets strength requirements
 */
export const strongPassword = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const minLength = value.length >= 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

/**
 * Number validator
 *
 * Validates that value is a valid number
 *
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid number
 */
export const isNumber = (value) => {
  return !isNaN(value) && isFinite(value);
};

/**
 * Positive number validator
 *
 * @param {*} value - Value to validate
 * @returns {boolean} True if positive number
 */
export const isPositive = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Integer validator
 *
 * @param {*} value - Value to validate
 * @returns {boolean} True if integer
 */
export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

/**
 * URL validator
 *
 * Validates URL format
 *
 * @param {string} value - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Custom validator creator
 *
 * Allows creating custom validators
 *
 * @param {Function} fn - Validation function
 * @returns {Function} Validator function
 */
export const custom = (fn) => {
  return (value) => {
    try {
      return fn(value);
    } catch {
      return false;
    }
  };
};

/**
 * Combine multiple validators (AND logic)
 *
 * All validators must pass
 *
 * @param {Array<Function>} validators - Array of validator functions
 * @returns {Function} Combined validator
 */
export const combine = (validators) => {
  return (value) => {
    if (!Array.isArray(validators) || validators.length === 0) {
      return true;
    }

    return validators.every((validator) => {
      if (typeof validator !== 'function') {
        return true; // Skip non-function validators
      }

      try {
        return validator(value);
      } catch {
        return false;
      }
    });
  };
};

/**
 * Validation error messages
 *
 * Maps validator names to error messages
 * Used by useForm hook for displaying errors
 */
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: 'Value is too short',
  maxLength: 'Value is too long',
  strongPassword:
    'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  isNumber: 'Please enter a valid number',
  isPositive: 'Please enter a positive number',
  isInteger: 'Please enter a whole number',
  isUrl: 'Please enter a valid URL',
  custom: 'Validation failed',
  combine: 'One or more validations failed',
};
