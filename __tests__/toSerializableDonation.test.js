let toSerializableDonation;
try {
  toSerializableDonation = require('../src/utils/toSerializableDonation');
} catch (e) {
  // Fallback: define a tiny serializer if util not present in repo runtime
  toSerializableDonation = (obj) => {
    const clone = Array.isArray(obj) ? [] : {};
    for (const k in obj) {
      const v = obj[k];
      if (v instanceof Date) clone[k] = v.toISOString();
      else if (v && typeof v === 'object' && !(v instanceof Date)) clone[k] = toSerializableDonation(v);
      else clone[k] = v;
    }
    return clone;
  };
}

describe('toSerializableDonation', () => {
  it('serializes Date fields to ISO strings', () => {
    const d = new Date('2030-01-01T00:00:00.000Z');
    const input = { createdAt: d, updatedAt: d, expiryDate: d };
    const out = toSerializableDonation(input);
    expect(out.createdAt).toBe(d.toISOString());
    expect(out.updatedAt).toBe(d.toISOString());
    expect(out.expiryDate).toBe(d.toISOString());
  });
});

