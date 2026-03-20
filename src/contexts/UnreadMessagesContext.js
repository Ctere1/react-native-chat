import PropTypes from 'prop-types';
import { query, where, collection, onSnapshot } from 'firebase/firestore';
import React, { useMemo, useState, useEffect, createContext } from 'react';

import { database } from '../config/firebase';
import { AuthenticatedUserContext } from './AuthenticatedUserContext';
import { isChatVisibleForUser, getUnreadCountForUser } from '../utils/chat';
import { backfillCurrentUserChatMetadata } from '../services/chatMessageService';

export const UnreadMessagesContext = createContext();

export const UnreadMessagesProvider = ({ children }) => {
  const { user } = React.useContext(AuthenticatedUserContext);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.email) {
      setUnreadCount(0);
      return () => {};
    }

    let unsubscribe = () => {};

    const subscribeToUnreadCounts = async () => {
      await backfillCurrentUserChatMetadata(user.email);

      const chatsRef = collection(database, 'chats');
      const chatsQuery = query(
        chatsRef,
        where('userEmails', 'array-contains', user.email)
      );

      unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const nextUnreadCount = snapshot.docs.reduce(
          (total, chat) =>
            total
            + (isChatVisibleForUser(chat.data(), user.email)
              ? getUnreadCountForUser(chat.data(), user.email)
              : 0),
          0
        );
        setUnreadCount(nextUnreadCount);
      });
    };

    subscribeToUnreadCounts().catch((error) => {
      console.log('Unable to subscribe to unread counts', error);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, [user]);

  const value = useMemo(() => ({ unreadCount, setUnreadCount }), [unreadCount, setUnreadCount]);

  return <UnreadMessagesContext.Provider value={value}>{children}</UnreadMessagesContext.Provider>;
};

UnreadMessagesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
