import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  doc,
  limit,
  query,
  getDoc,
  getDocs,
  orderBy,
  collection,
  onSnapshot,
  writeBatch,
  deleteField,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, database } from '../config/firebase';
import {
  mergeMessages,
  MESSAGE_STATUS,
  normalizeMessage,
  updateLastAccess,
  buildUnreadCounts,
  upsertUnreadCount,
  buildUserEmailList,
  incrementUnreadCounts,
  getLastMessageFromChat,
  reviveUsersForIncomingMessage,
} from '../utils/chat';

const CHAT_MESSAGE_PAGE_SIZE = 50;
const PENDING_MESSAGES_STORAGE_KEY = 'pendingChatMessages';

const getChatRef = (chatId) => doc(database, 'chats', chatId);
const getMessagesCollection = (chatId) => collection(database, 'chats', chatId, 'messages');
const getMessageRef = (chatId, messageId) => doc(getMessagesCollection(chatId), String(messageId));

const buildStoredMessage = (message) => {
  const normalizedMessage = normalizeMessage(message);

  return {
    ...normalizedMessage,
    createdAt: normalizedMessage.createdAt,
    image: normalizedMessage.image || null,
    status: normalizedMessage.status ?? MESSAGE_STATUS.SENT,
    video: normalizedMessage.video || null,
  };
};

const readPendingMessagesStore = async () => {
  const storedMessages = await AsyncStorage.getItem(PENDING_MESSAGES_STORAGE_KEY);

  return storedMessages ? JSON.parse(storedMessages) : {};
};

const writePendingMessagesStore = async (store) => {
  await AsyncStorage.setItem(PENDING_MESSAGES_STORAGE_KEY, JSON.stringify(store));
};

export const loadPendingMessages = async (chatId) => {
  const store = await readPendingMessagesStore();

  return (store[chatId] ?? []).map(normalizeMessage);
};

export const upsertPendingMessage = async (chatId, message) => {
  const store = await readPendingMessagesStore();
  const pendingMessages = store[chatId] ?? [];
  const nextMessage = normalizeMessage(message);
  const existingIndex = pendingMessages.findIndex((entry) => entry._id === nextMessage._id);

  const updatedMessages =
    existingIndex === -1
      ? [nextMessage, ...pendingMessages]
      : pendingMessages.map((entry, index) => (index === existingIndex ? nextMessage : entry));

  await writePendingMessagesStore({ ...store, [chatId]: updatedMessages });

  return updatedMessages.map(normalizeMessage);
};

export const removePendingMessage = async (chatId, messageId) => {
  const store = await readPendingMessagesStore();
  const pendingMessages = (store[chatId] ?? []).filter((entry) => entry._id !== messageId);

  await writePendingMessagesStore({ ...store, [chatId]: pendingMessages });

  return pendingMessages.map(normalizeMessage);
};

export const clearDeliveredPendingMessages = async (chatId, deliveredMessageIds = []) => {
  if (!deliveredMessageIds.length) {
    return loadPendingMessages(chatId);
  }

  const deliveredMessageIdSet = new Set(deliveredMessageIds);
  const store = await readPendingMessagesStore();
  const pendingMessages = (store[chatId] ?? []).filter(
    (entry) => !deliveredMessageIdSet.has(entry._id)
  );

  await writePendingMessagesStore({ ...store, [chatId]: pendingMessages });

  return pendingMessages.map(normalizeMessage);
};

export const subscribeToChatMessages = (chatId, onMessages, onError) =>
  onSnapshot(
    query(getMessagesCollection(chatId), orderBy('createdAt', 'desc'), limit(CHAT_MESSAGE_PAGE_SIZE)),
    (snapshot) => {
      onMessages(snapshot.docs.map((messageDoc) => normalizeMessage({ _id: messageDoc.id, ...messageDoc.data() })));
    },
    onError
  );

const buildLastMessageMetadata = (message) => {
  const normalizedMessage = normalizeMessage(message);

  return {
    _id: normalizedMessage._id,
    createdAt: normalizedMessage.createdAt,
    image: normalizedMessage.image || null,
    status: MESSAGE_STATUS.SENT,
    text: normalizedMessage.text,
    user: normalizedMessage.user,
    video: normalizedMessage.video || null,
  };
};

const buildChatMetadataPatch = ({ chatData, message, senderEmail }) => {
  const users = reviveUsersForIncomingMessage(chatData?.users ?? []);
  const unreadCounts = incrementUnreadCounts(users, chatData?.unreadCounts, senderEmail);
  const userEmails = chatData?.userEmails?.length ? chatData.userEmails : buildUserEmailList(users);

  return {
    lastAccess: updateLastAccess(chatData?.lastAccess, senderEmail, new Date()),
    lastMessage: {
      ...buildLastMessageMetadata(message),
      createdAt: serverTimestamp(),
    },
    lastUpdated: serverTimestamp(),
    schemaVersion: 2,
    unreadCounts,
    userEmails,
    users,
  };
};

export const sendChatMessage = async ({ chatId, message }) => {
  const senderEmail = message?.user?._id || auth?.currentUser?.email;

  await runTransaction(database, async (transaction) => {
    const chatRef = getChatRef(chatId);
    const chatSnapshot = await transaction.get(chatRef);

    if (!chatSnapshot.exists()) {
      throw new Error('Chat does not exist');
    }

    const chatData = chatSnapshot.data();
    const messageRef = getMessageRef(chatId, message._id);

    transaction.set(messageRef, {
      ...buildStoredMessage(message),
      createdAt: serverTimestamp(),
      status: MESSAGE_STATUS.SENT,
    });
    transaction.set(chatRef, buildChatMetadataPatch({ chatData, message, senderEmail }), {
      merge: true,
    });
  });
};

export const markChatAsRead = async ({ chatId, userEmail }) => {
  if (!chatId || !userEmail) {
    return;
  }

  await runTransaction(database, async (transaction) => {
    const chatRef = getChatRef(chatId);
    const chatSnapshot = await transaction.get(chatRef);

    if (!chatSnapshot.exists()) {
      return;
    }

    const chatData = chatSnapshot.data();
    const unreadCounts = upsertUnreadCount(chatData?.unreadCounts ?? buildUnreadCounts(chatData?.users), userEmail, 0);

    transaction.set(
      chatRef,
      {
        lastAccess: updateLastAccess(chatData?.lastAccess, userEmail, new Date()),
        unreadCounts,
      },
      { merge: true }
    );
  });
};

export const ensureChatSchema = async ({ chatId, chatData }) => {
  const users = chatData?.users ?? [];
  const hasLegacyMessages = Array.isArray(chatData?.messages);
  const needsMetadataPatch =
    chatData?.schemaVersion !== 2 || !chatData?.userEmails || !Array.isArray(chatData?.unreadCounts);

  if (!hasLegacyMessages && !needsMetadataPatch) {
    return;
  }

  const chatRef = getChatRef(chatId);
  const batch = writeBatch(database);
  const legacyMessages = (chatData?.messages ?? []).map(normalizeMessage);

  legacyMessages.forEach((message) => {
    batch.set(getMessageRef(chatId, message._id), buildStoredMessage(message), { merge: true });
  });

  const metadataPatch = {
    lastMessage: getLastMessageFromChat(chatData),
    schemaVersion: 2,
    unreadCounts: Array.isArray(chatData?.unreadCounts) ? chatData.unreadCounts : buildUnreadCounts(users),
    userEmails: chatData?.userEmails?.length ? chatData.userEmails : buildUserEmailList(users),
  };

  if (hasLegacyMessages) {
    metadataPatch.messages = deleteField();
    metadataPatch.messagesMigratedAt = serverTimestamp();
  }

  batch.set(chatRef, metadataPatch, { merge: true });

  await batch.commit();
};

export const backfillCurrentUserChatMetadata = async (userEmail) => {
  if (!userEmail) {
    return;
  }

  const chatsSnapshot = await getDocs(collection(database, 'chats'));
  const chatsToMigrate = chatsSnapshot.docs.filter((chatDocument) => {
    const chatData = chatDocument.data();
    const users = chatData?.users ?? [];

    return (
      users.some((user) => user.email === userEmail)
      && (
        chatData?.schemaVersion !== 2
        || !Array.isArray(chatData?.userEmails)
        || !Array.isArray(chatData?.unreadCounts)
        || Array.isArray(chatData?.messages)
      )
    );
  });

  await Promise.all(
    chatsToMigrate.map((chatDocument) =>
      ensureChatSchema({ chatId: chatDocument.id, chatData: chatDocument.data() })
    )
  );
};

export const flushPendingMessages = async ({ chatId }) => {
  const pendingMessages = await loadPendingMessages(chatId);
  const unsentMessages = pendingMessages.filter(
    (pendingMessage) => pendingMessage.status !== MESSAGE_STATUS.SENT
  );

  await Promise.all(
    unsentMessages.map(async (pendingMessage) => {
      await sendChatMessage({
        chatId,
        message: {
          ...pendingMessage,
          status: MESSAGE_STATUS.SENDING,
        },
      });
      await removePendingMessage(chatId, pendingMessage._id);
    })
  );
};

export const getChatMetadata = async (chatId) => {
  const chatSnapshot = await getDoc(getChatRef(chatId));

  return chatSnapshot.exists() ? chatSnapshot.data() : null;
};

export const mergeServerAndPendingMessages = (serverMessages, pendingMessages) =>
  mergeMessages(serverMessages, pendingMessages);

export { CHAT_MESSAGE_PAGE_SIZE };
