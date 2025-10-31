jest.mock('firebase/firestore', () => ({}), { virtual: true });
jest.mock('firebase/storage', () => ({}), { virtual: true });

import { FirebaseDonationRepository } from '../src/domain/repository/DonationRepository';

jest.mock('../src/config/firebase', () => ({ db: {}, storage: {} }));

describe('FirebaseDonationRepository _toDonation', () => {
  test('converts Firestore types to JS dates', () => {
    const repo = new FirebaseDonationRepository();
    const now = new Date();
    const fakeTs = { toDate: () => now };
    const snap = {
      id: '1',
      data: () => ({ createdAt: fakeTs, updatedAt: fakeTs, expiryDate: fakeTs }),
    };
    const d = repo._toDonation(snap);
    expect(d.id).toBe('1');
    expect(d.createdAt).toBe(now);
    expect(d.updatedAt).toBe(now);
    expect(d.expiryDate).toBe(now);
  });
});
