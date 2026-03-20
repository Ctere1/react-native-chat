import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, FlatList, StyleSheet } from 'react-native';

import Cell from '../components/Cell';
import { database } from '../config/firebase';
import { colors, layout, spacing } from '../config/constants';
import { buildInitials, dedupeUsersByEmail } from '../utils/chat';

const ChatInfo = ({ route }) => {
  const { chatId, chatName } = route.params;
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const chatRef = doc(database, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          if (chatData) {
            if (Array.isArray(chatData.users)) {
              setUsers(chatData.users);
            }
            if (chatData.groupName) {
              setGroupName(chatData.groupName);
            }
          } else {
            setUsers([]);
          }
        } else {
          Alert.alert('Error', 'Chat does not exist');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while fetching chat info');
        console.error('Error fetching chat info: ', error);
      }
    };

    fetchChatInfo();
  }, [chatId]);

  const renderUser = ({ item }) => (
    <View style={styles.userContainer}>
      <Ionicons name="person-outline" size={30} color={colors.primary} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
    </View>
  );

  const uniqueUsers = useMemo(() => dedupeUsersByEmail(users), [users]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{buildInitials(chatName)}</Text>
        </View>
        <View style={styles.chatHeader}>
          {groupName ? (
            <>
              <Text style={styles.groupLabel}>Group</Text>
              <Text style={styles.chatTitle}>{chatName}</Text>
            </>
          ) : (
            <Text style={styles.chatTitle}>{chatName}</Text>
          )}
        </View>
      </View>

      <Cell
        title="About"
        subtitle="Available"
        icon="information-circle-outline"
        iconColor={colors.primary}
        style={styles.cell}
      />

      <Text style={styles.usersTitle}>Members</Text>
      <FlatList
        data={uniqueUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.email}
        contentContainerStyle={styles.usersList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  avatarLabel: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  cell: {
    backgroundColor: 'white',
    borderRadius: layout.cardRadius,
    marginBottom: spacing.sm,
    marginHorizontal: layout.pageInset,
    overflow: 'hidden',
  },
  chatHeader: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  chatTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  groupLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xxs,
  },
  headerSection: {
    marginBottom: spacing.md,
    marginTop: layout.pageTopInset,
  },
  userContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  userInfo: {
    marginLeft: spacing.sm,
  },
  userName: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  usersList: {
    backgroundColor: 'white',
    borderRadius: layout.cardRadius,
    marginHorizontal: layout.pageInset,
    overflow: 'hidden',
  },
  usersTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    marginHorizontal: layout.pageInset,
  },
});

ChatInfo.propTypes = {
  route: PropTypes.object.isRequired,
};

export default ChatInfo;
