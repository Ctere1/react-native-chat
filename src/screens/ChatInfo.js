import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import Cell from '../components/Cell';
import { colors } from '../config/constants';
import { database } from '../config/firebase';

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

  const uniqueUsers = Array.from(new Map(users.map((user) => [user.email, user])).values());

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.avatar}>
        <View>
          <Text style={styles.avatarLabel}>
            {chatName.split(' ').reduce((prev, current) => `${prev}${current[0]}`, '')}
          </Text>
        </View>
      </TouchableOpacity>
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
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20,
    width: 120,
  },
  avatarLabel: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  cell: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 0.5,
    marginBottom: 15,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chatHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chatTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  groupLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  userContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  usersList: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 0.5,
    marginHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  usersTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 16,
    marginTop: 20,
  },
});

ChatInfo.propTypes = {
  route: PropTypes.object.isRequired,
};

export default ChatInfo;
