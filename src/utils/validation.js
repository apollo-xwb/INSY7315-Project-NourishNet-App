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
