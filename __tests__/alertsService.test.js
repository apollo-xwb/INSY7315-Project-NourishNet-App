jest.mock('../src/domain/repository/AlertsRepository', () => ({
  FirebaseAlertsRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn(async (userId, data) => ({ id: 'a1', userId, ...data })),
    findUnread: jest.fn(async () => [{ id: 'a1' }]),
    findByUser: jest.fn(async () => [{ id: 'a1' }, { id: 'a2' }]),
    unreadCount: jest.fn(async () => 3),
    markRead: jest.fn(async () => {}),
    markAllRead: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
    deleteExpired: jest.fn(async () => 2),
  })),
}));

import {
  createAlert,
  getUnreadAlerts,
  getUserAlerts,
  getUnreadAlertCount,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  deleteExpiredAlerts,
} from '../src/services/alertsService';

describe('alertsService', () => {
  test('createAlert returns created alert', async () => {
    const a = await createAlert('u1', { title: 'T', message: 'M' });
    expect(a.id).toBe('a1');
  });

  test('getUnreadAlerts returns array', async () => {
    const arr = await getUnreadAlerts('u1');
    expect(arr.length).toBe(1);
  });

  test('getUserAlerts returns list', async () => {
    const arr = await getUserAlerts('u1');
    expect(arr.length).toBe(2);
  });

  test('getUnreadAlertCount returns number', async () => {
    const c = await getUnreadAlertCount('u1');
    expect(c).toBe(3);
  });

  test('markAlertAsRead resolves', async () => {
    await expect(markAlertAsRead('a1')).resolves.toBeUndefined();
  });

  test('markAllAlertsAsRead resolves', async () => {
    await expect(markAllAlertsAsRead('u1')).resolves.toBeUndefined();
  });

  test('deleteAlert resolves', async () => {
    await expect(deleteAlert('a1')).resolves.toBeUndefined();
  });

  test('deleteExpiredAlerts returns count', async () => {
    const n = await deleteExpiredAlerts('u1');
    expect(n).toBe(2);
  });
});





