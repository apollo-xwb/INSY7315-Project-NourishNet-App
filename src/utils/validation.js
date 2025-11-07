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

export const email = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

export const phone = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const cleaned = value.replace(/[\s-]/g, '');
  const phoneRegex = /^(\+27|27|0)[0-9]{9}$/;
  return phoneRegex.test(cleaned);
};

export const minLength = (min) => {
  return (value) => {
    if (!value || typeof value !== 'string') {
      return false;
    }

    return value.trim().length >= min;
  };
};

export const maxLength = (max) => {
  return (value) => {
    if (!value || typeof value !== 'string') {
      return true;
    }

    return value.trim().length <= max;
  };
};

export const strongPassword = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const minLen = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  return minLen && hasUpper && hasLower && hasNumber && hasSpecial;
};

export const isNumber = (value) => {
  return !isNaN(value) && isFinite(value);
};

export const isPositive = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const isInteger = (value) => {
  const num = Number(value);
  return Number.isInteger(num);
};

export const isUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.host);
  } catch (_err) {
    return false;
  }
};

export const custom = (fn) => {
  return (value) => {
    try {
      return fn(value);
    } catch {
      return false;
    }
  };
};

export const combine = (validators) => {
  return (value) => {
    if (!Array.isArray(validators) || validators.length === 0) {
      return true;
    }

    return validators.every((validator) => {
      if (typeof validator !== 'function') {
        return true;
      }

      try {
        return validator(value);
      } catch {
        return false;
      }
    });
  };
};

export const validationMessages = {
  required: 'This field is required.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  minLength: (min) => `Must be at least ${min} characters long.`,
  maxLength: (max) => `Must be at most ${max} characters long.`,
  strongPassword:
    'Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.',
};
