import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

function Hello() {
  return <Text accessibilityLabel="greeting">Hello</Text>;
}

describe('RN UI smoke', () => {
  it('renders a simple component', () => {
    const { getByLabelText } = render(<Hello />);
    expect(getByLabelText('greeting').props.children).toBe('Hello');
  });
});
