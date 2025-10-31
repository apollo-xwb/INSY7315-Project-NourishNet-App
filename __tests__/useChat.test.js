import { renderHook, act } from '@testing-library/react-native';

jest.mock('../src/services/chatService', () => ({
  subscribeToMessages: jest.fn((chatId, cb) => {
    cb([{ id: 'm1', chatId, text: 'hi', senderId: 'u2' }]);
    return () => {};
  }),
  sendMessage: jest.fn(async (chatId, userId, text, metadata) => ({
    id: 'm2',
    chatId,
    text,
    senderId: userId,
    ...metadata,
  })),
}));

import useChat from '../src/hooks/useChat';

describe('useChat', () => {
  test('subscribes and receives messages', async () => {
    const onNewMessage = jest.fn();
    const { result } = renderHook(() => useChat('c1', 'u1', { autoSubscribe: true, onNewMessage }));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.messages.length).toBe(1);
    expect(onNewMessage).toHaveBeenCalled();
  });

  test('sendMessage performs optimistic update and resolves', async () => {
    const { result } = renderHook(() => useChat('c1', 'u1'));
    const ok = await act(async () => await result.current.sendMessage('Hello')); // returns boolean
    expect(result.current.messages.length).toBeGreaterThan(0);
  });
});




