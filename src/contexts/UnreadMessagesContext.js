import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useMemo, useState, useEffect, createContext } from 'react';

export const UnreadMessagesContext = createContext();

export const UnreadMessagesProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('newMessages');
        const newMessages = storedMessages ? JSON.parse(storedMessages) : {};
        const count = Object.values(newMessages).reduce((total, num) => total + num, 0);
        setUnreadCount(count);
      } catch (error) {
        console.log('Error loading unread messages count', error);
      }
    };
    loadUnreadCount();
  }, []);

  const value = useMemo(() => ({ unreadCount, setUnreadCount }), [unreadCount, setUnreadCount]);

  return <UnreadMessagesContext.Provider value={value}>{children}</UnreadMessagesContext.Provider>;
};

UnreadMessagesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
