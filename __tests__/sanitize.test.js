let sanitize;
try {
  // ESM default export
  sanitize = require('../src/utils/sanitize').default;
} catch (_e) {}
if (!sanitize) {
  // CJS export or fallback
  try {
    sanitize = require('../src/utils/sanitize');
  } catch (_e) {}
}

describe('sanitize', () => {
  it('keeps Date objects intact', () => {
    const input = { expiryDate: new Date('2030-01-01T00:00:00.000Z') };
    const out = sanitize(input);
    expect(out.expiryDate instanceof Date).toBe(true);
  });

  it('handles undefined/functions safely', () => {
    const input = { a: 1, b: undefined, c: () => {} };
    const out = sanitize(input);
    expect(out.a).toBe(1);
  });
});
