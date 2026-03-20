import {
  getChatUser,
  buildInitials,
  mergeMessages,
  MESSAGE_STATUS,
  getDisplayName,
  normalizeMessage,
  buildUnreadCounts,
  getMessagePreview,
  getUserStatusText,
  markUserAsDeleted,
  normalizeTimestamp,
  areAllUsersDeleted,
  dedupeUsersByEmail,
  getChatDisplayName,
  buildChatParticipant,
  isChatVisibleForUser,
  getUnreadCountForUser,
  incrementUnreadCounts,
  reviveUsersForIncomingMessage,
} from '../chat';

describe('chat utils', () => {
  it('builds uppercase initials from a display name', () => {
    expect(buildInitials('Ada Lovelace')).toBe('AL');
  });

  it('creates a normalized chat participant', () => {
    expect(buildChatParticipant({ email: 'ada@example.com', name: 'Ada' })).toEqual({
      email: 'ada@example.com',
      name: 'Ada',
      deletedFromChat: false,
    });
  });

  it('formats display names and current-user subtitles consistently', () => {
    expect(getDisplayName({ email: 'ada@example.com', name: 'Ada' }, 'grace@example.com')).toBe(
      'Ada'
    );
    expect(getDisplayName({ email: 'ada@example.com', name: 'Ada' }, 'ada@example.com')).toBe(
      'Ada*(You)'
    );
    expect(getUserStatusText('ada@example.com', 'ada@example.com')).toBe('Message yourself');
  });

  it('derives the chat display name for direct chats', () => {
    expect(
      getChatDisplayName(
        {
          users: [
            { email: 'ada@example.com', name: 'Ada' },
            { email: 'grace@example.com', name: 'Grace' },
          ],
        },
        { email: 'ada@example.com', displayName: 'Ada' }
      )
    ).toBe('Grace');
  });

  it('formats message previews for text and images', () => {
    expect(
      getMessagePreview(
        { text: 'Hello there', user: { _id: 'ada@example.com', name: 'Ada Lovelace' } },
        'ada@example.com'
      )
    ).toBe('You: Hello there');

    expect(
      getMessagePreview(
        {
          image: 'https://example.com/pic.jpg',
          user: { _id: 'grace@example.com', name: 'Grace Hopper' },
        },
        'ada@example.com'
      )
    ).toBe('Grace: sent an image');
  });

  it('marks users deleted and detects when the whole chat is deleted', () => {
    const users = [
      { email: 'ada@example.com', deletedFromChat: false },
      { email: 'grace@example.com', deletedFromChat: true },
    ];

    const updatedUsers = markUserAsDeleted(users, 'ada@example.com');

    expect(updatedUsers[0].deletedFromChat).toBe(true);
    expect(areAllUsersDeleted(updatedUsers)).toBe(true);
  });

  it('determines chat visibility for the current user from participant state', () => {
    const chatData = {
      users: [
        { email: 'ada@example.com', deletedFromChat: true },
        { email: 'grace@example.com', deletedFromChat: false },
      ],
    };

    expect(getChatUser(chatData, 'ada@example.com')).toEqual({
      email: 'ada@example.com',
      deletedFromChat: true,
    });
    expect(isChatVisibleForUser(chatData, 'ada@example.com')).toBe(false);
    expect(isChatVisibleForUser(chatData, 'grace@example.com')).toBe(true);
  });

  it('revives deleted participants when a new message arrives', () => {
    expect(
      reviveUsersForIncomingMessage([
        { email: 'ada@example.com', deletedFromChat: true },
        { email: 'grace@example.com', deletedFromChat: false },
      ])
    ).toEqual([
      { email: 'ada@example.com', deletedFromChat: false },
      { email: 'grace@example.com', deletedFromChat: false },
    ]);
  });

  it('deduplicates chat members by email', () => {
    expect(
      dedupeUsersByEmail([
        { email: 'ada@example.com', name: 'Ada' },
        { email: 'ada@example.com', name: 'Ada Lovelace' },
        { email: 'grace@example.com', name: 'Grace' },
      ])
    ).toEqual([
      { email: 'ada@example.com', name: 'Ada Lovelace' },
      { email: 'grace@example.com', name: 'Grace' },
    ]);
  });

  it('normalizes timestamps and message defaults consistently', () => {
    const createdAt = normalizeTimestamp('2024-01-02T03:04:05.000Z');
    const message = normalizeMessage({ _id: 'm1', text: null, createdAt });

    expect(createdAt).toBeInstanceOf(Date);
    expect(message.text).toBe('');
    expect(message.image).toBe('');
    expect(message.video).toBe('');
    expect(message.status).toBe(MESSAGE_STATUS.SENT);
  });

  it('merges pending and confirmed messages without duplicates', () => {
    const confirmedMessage = {
      _id: 'message-1',
      createdAt: new Date('2024-01-02T12:00:00.000Z'),
      status: MESSAGE_STATUS.SENT,
      text: 'Delivered',
      user: { _id: 'ada@example.com', name: 'Ada' },
    };

    const pendingMessage = {
      ...confirmedMessage,
      status: MESSAGE_STATUS.SENDING,
      text: 'Pending copy',
    };

    expect(mergeMessages([confirmedMessage], [pendingMessage])).toEqual([
      {
        ...confirmedMessage,
        image: '',
        video: '',
      },
    ]);
  });

  it('increments unread counts for recipients and keeps sender at zero', () => {
    const users = [
      { email: 'ada@example.com', deletedFromChat: false },
      { email: 'grace@example.com', deletedFromChat: false },
    ];

    const unreadCounts = incrementUnreadCounts(
      users,
      buildUnreadCounts(users),
      'ada@example.com'
    );

    expect(getUnreadCountForUser({ unreadCounts }, 'ada@example.com')).toBe(0);
    expect(getUnreadCountForUser({ unreadCounts }, 'grace@example.com')).toBe(1);
  });
});
