import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import ContactRow from '../ContactRow';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('ContactRow', () => {
  it('renders contact details and forwards user interactions', () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();

    const { getByText } = render(
      <ContactRow
        name="Ada Lovelace"
        subtitle="Online"
        subtitle2="Today"
        onPress={onPress}
        onLongPress={onLongPress}
        newMessageCount={2}
      />
    );

    fireEvent.press(getByText('Ada Lovelace'));
    fireEvent(getByText('Ada Lovelace'), 'longPress');

    expect(getByText('AL')).toBeTruthy();
    expect(getByText('Online')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
