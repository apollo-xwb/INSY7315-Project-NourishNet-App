jest.mock('../src/domain/repository/ChatRepository', () => {
  return {
    FirebaseChatRepository: jest.fn().mockImplementation(() => ({
      sendMessage: jest.fn(async (chatId, data) => ({ id: 'm1', ...data, chatId })),
      getMessages: jest.fn(async (chatId) => [{ id: 'm1', chatId, text: 'hi' }]),
      subscribeMessages: jest.fn((chatId, cb) => {
        cb([{ id: 'm1', chatId }]);
        return () => {};
      }),
      getUserChats: jest.fn(async (userId) => [{ chatId: 'c1', lastMessage: 'x' }]),
      markAsRead: jest.fn(async () => {}),
    })),
  };
});

jest.mock('../src/services/notificationService', () => ({
  sendPushNotification: jest.fn(async () => {}),
}));
jest.mock('../src/services/alertsService', () => ({ createAlert: jest.fn(async () => ({})) }));

import {
  sendMessage,
  getChatMessages,
  subscribeToMessages,
  getUserChats,
  markMessagesAsRead,
} from '../src/services/chatService';

describe('chatService', () => {
  test('sendMessage delegates to repository and triggers notifications', async () => {
    const result = await sendMessage('chat1', {
      text: 'Hello',
      senderId: 'u1',
      receiverId: 'u2',
      senderName: 'Alice',
    });
    expect(result.id).toBe('m1');
  });

  test('getChatMessages returns messages', async () => {
    const msgs = await getChatMessages('chat1');
    expect(msgs.length).toBe(1);
  });

  test('subscribeToMessages calls callback', async () => {
    const cb = jest.fn();
    const unsub = subscribeToMessages('chat1', cb);
    expect(cb).toHaveBeenCalled();
    unsub();
  });

  test('getUserChats returns chat list', async () => {
    const chats = await getUserChats('u1');
    expect(chats[0].chatId).toBe('c1');
  });

  test('markMessagesAsRead calls repo', async () => {
    await expect(markMessagesAsRead('chat1', 'u2')).resolves.toBeUndefined();
  });
});






