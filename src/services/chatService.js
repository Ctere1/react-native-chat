import { doc, setDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';

import { database } from '../config/firebase';
import {
  markUserAsDeleted,
  buildUnreadCounts,
  areAllUsersDeleted,
  buildUserEmailList,
  buildChatParticipant,
} from '../utils/chat';

export const deleteChatForUser = async ({ chatId, chatData, userEmail }) => {
  const chatRef = doc(database, 'chats', chatId);
  const updatedUsers = markUserAsDeleted(chatData?.users, userEmail);

  await setDoc(chatRef, { users: updatedUsers }, { merge: true });

  if (areAllUsersDeleted(updatedUsers)) {
    await deleteDoc(chatRef);
  }
};

export const createDirectChat = async ({ currentUser, otherUser }) => {
  const chatRef = doc(collection(database, 'chats'));
  const users = [
    buildChatParticipant({
      email: currentUser?.email,
      name: currentUser?.displayName,
    }),
    buildChatParticipant({
      email: otherUser?.email,
      name: otherUser?.name,
    }),
  ];

  await setDoc(chatRef, {
    lastUpdated: serverTimestamp(),
    groupName: '',
    lastMessage: null,
    lastAccess: [
      { email: currentUser?.email, date: new Date() },
      { email: otherUser?.email, date: null },
    ],
    schemaVersion: 2,
    unreadCounts: buildUnreadCounts(users),
    userEmails: buildUserEmailList(users),
    users,
  });

  return chatRef.id;
};

export const createGroupChat = async ({ currentUser, groupName, selectedUsers }) => {
  const chatRef = doc(collection(database, 'chats'));
  const users = [
    buildChatParticipant({
      email: currentUser?.email,
      name: currentUser?.displayName,
    }),
    ...selectedUsers.map((user) =>
      buildChatParticipant({
        email: user?.email,
        name: user?.name,
      })
    ),
  ];

  await setDoc(chatRef, {
    lastUpdated: serverTimestamp(),
    lastAccess: [{ email: currentUser?.email, date: new Date() }],
    lastMessage: null,
    groupName: groupName.trim(),
    groupAdmins: [currentUser?.email],
    schemaVersion: 2,
    unreadCounts: buildUnreadCounts(users),
    userEmails: buildUserEmailList(users),
    users,
  });

  return chatRef.id;
};
