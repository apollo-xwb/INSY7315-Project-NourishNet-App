import {
  required,
  email,
  phone,
  minLength,
  maxLength,
  strongPassword,
  isNumber,
  isPositive,
  isInteger,
  isUrl,
  combine,
} from '../src/utils/validation';

describe('validation utils', () => {
  test('required', () => {
    expect(required('x')).toBe(true);
    expect(required('   ')).toBe(false);
    expect(required([])).toBe(false);
    expect(required(['a'])).toBe(true);
    expect(required(null)).toBe(false);
  });

  test('email', () => {
    expect(email('user@example.com')).toBe(true);
    expect(email('bad@address')).toBe(false);
  });

  test('phone ZA', () => {
    expect(phone('+27123456789')).toBe(true);
    expect(phone('0123456789')).toBe(true);
    expect(phone('12345')).toBe(false);
  });

  test('length validators', () => {
    expect(minLength(3)('abc')).toBe(true);
    expect(minLength(3)('ab')).toBe(false);
    expect(maxLength(3)('abc')).toBe(true);
    expect(maxLength(3)('abcd')).toBe(false);
  });

  test('strongPassword', () => {
    expect(strongPassword('Aa1!aaaa')).toBe(true);
    expect(strongPassword('weak')).toBe(false);
  });

  test('numbers', () => {
    expect(isNumber('5')).toBe(true);
    expect(isPositive('10')).toBe(true);
    expect(isInteger('3')).toBe(true);
    expect(isInteger('3.2')).toBe(false);
  });

  test('isUrl', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('not a url')).toBe(false);
  });

  test('combine', () => {
    const validator = combine([required, minLength(2)]);
    expect(validator('ok')).toBe(true);
    expect(validator('x')).toBe(false);
  });
});






