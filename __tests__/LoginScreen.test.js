import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';

jest.mock('../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#fff',
        surface: '#fff',
        text: '#000',
        textSecondary: '#555',
        primary: '#00f',
        border: '#eee',
        error: '#f00',
      },
    },
  }),
}));

jest.mock('../src/contexts/AlertContext', () => ({
  useToast: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
}));

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }));

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    signin: jest.fn(async () => ({ success: false, error: 'bad' })),
    signInWithGoogle: jest.fn(async () => ({ success: false })),
  }),
}));

jest.mock('../src/utils/IconWrapper', () => ({ __esModule: true, default: () => null }));

describe('LoginScreen', () => {
  test('renders and allows button press', () => {
    const { getByLabelText } = render(<LoginScreen navigation={{ navigate: jest.fn() }} />);
    const btn = getByLabelText('login');
    fireEvent.press(btn);
  });

  test('submits with sanitized inputs', () => {
    const { getByLabelText, getByPlaceholderText } = render(
      <LoginScreen navigation={{ navigate: jest.fn() }} />,
    );
    fireEvent.changeText(getByPlaceholderText('email'), ' user@example.com ');
    fireEvent.changeText(getByLabelText('password'), ' P@ssw0rd! ');
    fireEvent.press(getByLabelText('login'));
  });
});
