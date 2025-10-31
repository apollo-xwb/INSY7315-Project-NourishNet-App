/* eslint-disable no-control-regex */
const sanitizeString = (s) => {
  if (typeof s !== 'string') return s;
  return s
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim();
};

const isPlainObject = (val) => {
  if (val === null || typeof val !== 'object') return false;
  if (val instanceof Date) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || proto === null;
};

export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj; // preserve Date
  if (!isPlainObject(obj) && !Array.isArray(obj)) return obj; // leave class instances

  const out = Array.isArray(obj) ? [] : {};
  for (const k in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
    const v = obj[k];
    if (typeof v === 'string') out[k] = sanitizeString(v);
    else if (v instanceof Date) out[k] = v;
    else if (Array.isArray(v) || isPlainObject(v)) out[k] = sanitizeObject(v);
    else out[k] = v;
  }
  return out;
};

export const sanitize = (value) => {
  return typeof value === 'string' ? sanitizeString(value) : sanitizeObject(value);
};

export default sanitize;
