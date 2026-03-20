export const FALLBACK_CONTACT_NAME = '~ No Name or Email ~';
export const MESSAGE_STATUS = {
  FAILED: 'failed',
  READ: 'read',
  SENDING: 'sending',
  SENT: 'sent',
};

export const buildInitials = (value = '') => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '?';
  }

  return trimmedValue
    .split(/\s+/)
    .filter(Boolean)
    .reduce((initials, part) => `${initials}${part[0].toUpperCase()}`, '');
};

export const buildChatParticipant = ({ email, name }) => ({
  email: email ?? '',
  name: name ?? '',
  deletedFromChat: false,
});

export const buildUserEmailList = (users = []) =>
  dedupeUsersByEmail(users)
    .map((user) => user.email)
    .filter(Boolean);

export const getChatUser = (chatData, userEmail) =>
  (chatData?.users ?? []).find((user) => user.email === userEmail) ?? null;

export const isChatVisibleForUser = (chatData, userEmail) => {
  if (!userEmail) {
    return false;
  }

  const chatUser = getChatUser(chatData, userEmail);

  if (!chatUser) {
    return false;
  }

  return !chatUser.deletedFromChat;
};

export const getDisplayName = (user, currentUserEmail) => {
  const userName = user?.name?.trim();
  const userEmail = user?.email?.trim();

  if (userName) {
    return userEmail === currentUserEmail ? `${userName}*(You)` : userName;
  }

  return userEmail || FALLBACK_CONTACT_NAME;
};

export const getUserStatusText = (userEmail, currentUserEmail) =>
  userEmail === currentUserEmail ? 'Message yourself' : 'User status';

export const getChatDisplayName = (chatData, currentUser) => {
  const { users = [], groupName } = chatData ?? {};

  if (groupName) {
    return groupName;
  }

  if (!Array.isArray(users) || users.length !== 2) {
    return FALLBACK_CONTACT_NAME;
  }

  if (currentUser?.displayName) {
    return users[0].name === currentUser.displayName ? users[1].name : users[0].name;
  }

  if (currentUser?.email) {
    return users[0].email === currentUser.email ? users[1].email : users[0].email;
  }

  return FALLBACK_CONTACT_NAME;
};

export const getMessagePreview = (message, currentUserEmail) => {
  if (!message) {
    return 'No messages yet';
  }

  const isCurrentUser = currentUserEmail === message.user?._id;
  const userName = isCurrentUser ? 'You' : (message.user?.name || '').split(' ')[0];

  if (message.image) {
    return `${userName}: sent an image`;
  }

  if (message.video) {
    return `${userName}: sent a video`;
  }

  const messageText = message.text?.length > 20 ? `${message.text.substring(0, 20)}...` : message.text;

  return `${userName}: ${messageText || ''}`;
};

export const normalizeTimestamp = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate();
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export const normalizeMessage = (message = {}) => ({
  ...message,
  createdAt: normalizeTimestamp(message.createdAt) ?? new Date(),
  image: message.image ?? '',
  status: message.status ?? MESSAGE_STATUS.SENT,
  text: message.text ?? '',
  video: message.video ?? '',
});

export const mergeMessages = (serverMessages = [], pendingMessages = []) => {
  const mergedMessages = new Map();

  [...pendingMessages, ...serverMessages].forEach((message) => {
    if (!message?._id) {
      return;
    }

    const normalizedMessage = normalizeMessage(message);
    const existingMessage = mergedMessages.get(normalizedMessage._id);

    if (!existingMessage || normalizedMessage.status !== MESSAGE_STATUS.SENDING) {
      mergedMessages.set(normalizedMessage._id, {
        ...existingMessage,
        ...normalizedMessage,
      });
    }
  });

  return [...mergedMessages.values()].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  );
};

export const markUserAsDeleted = (users = [], userEmail) =>
  users.map((user) =>
    user.email === userEmail ? { ...user, deletedFromChat: true } : user
  );

export const reviveUsersForIncomingMessage = (users = []) =>
  users.map((user) => ({ ...user, deletedFromChat: false }));

export const areAllUsersDeleted = (users = []) => users.every((user) => user.deletedFromChat);

export const dedupeUsersByEmail = (users = []) =>
  Array.from(new Map(users.filter((user) => user?.email).map((user) => [user.email, user])).values());

export const buildUnreadCounts = (users = []) =>
  dedupeUsersByEmail(users).map((user) => ({
    count: 0,
    email: user.email,
  }));

export const getUnreadCountForUser = (chatData, userEmail) => {
  if (!userEmail) {
    return 0;
  }

  const unreadEntry = (chatData?.unreadCounts ?? []).find((entry) => entry.email === userEmail);

  return unreadEntry?.count ?? 0;
};

export const upsertUnreadCount = (unreadCounts = [], userEmail, count) => {
  const existingEntry = unreadCounts.find((entry) => entry.email === userEmail);

  if (!existingEntry) {
    return [...unreadCounts, { email: userEmail, count }];
  }

  return unreadCounts.map((entry) => (entry.email === userEmail ? { ...entry, count } : entry));
};

export const incrementUnreadCounts = (users = [], unreadCounts = [], senderEmail) =>
  dedupeUsersByEmail(users).map((user) => {
    const existingEntry = unreadCounts.find((entry) => entry.email === user.email);
    const nextCount =
      user.email === senderEmail ? 0 : (existingEntry?.count ?? 0) + (user.deletedFromChat ? 0 : 1);

    return {
      count: nextCount,
      email: user.email,
    };
  });

export const updateLastAccess = (lastAccess = [], userEmail, value) => {
  const normalizedLastAccess = Array.isArray(lastAccess) ? lastAccess : [];
  const existingEntry = normalizedLastAccess.find((entry) => entry.email === userEmail);

  if (!existingEntry) {
    return [...normalizedLastAccess, { email: userEmail, date: value }];
  }

  return normalizedLastAccess.map((entry) =>
    entry.email === userEmail ? { ...entry, date: value } : entry
  );
};

export const getLastMessageFromChat = (chatData) =>
  chatData?.lastMessage ? normalizeMessage(chatData.lastMessage) : null;
