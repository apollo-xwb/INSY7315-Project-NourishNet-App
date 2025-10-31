import { renderHook, act } from '@testing-library/react-native';
import useDonations from '../src/hooks/useDonations';

jest.mock('../src/services/donationService', () => ({
  getDonations: jest.fn(async () => [{ id: '1', itemName: 'Bread' }]),
  subscribeToDonations: jest.fn((cb) => {
    cb([{ id: '2' }]);
    return () => {};
  }),
}));

describe('useDonations', () => {
  test('loads donations on mount (autoLoad)', async () => {
    const { result } = renderHook(() => useDonations({ autoLoad: true }));
    expect(result.current.loading).toBe(true);
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.donations.length).toBe(1);
  });

  test('realtime subscription updates donations', async () => {
    const { result } = renderHook(() => useDonations({ autoLoad: true, realtime: true }));
    await act(async () => {});
    expect(result.current.donations.length).toBe(1); // from subscribe mock
  });
});




