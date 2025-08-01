import React from 'react';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { Text, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

import { auth, database } from '../config/firebase';

const ChatMenu = ({ chatName, chatId }) => {
  const navigation = useNavigation();

  const handleDeleteChat = () => {
    Alert.alert(
      'Delete this chat?',
      'Messages will be removed from your device.',
      [
        {
          text: 'Delete chat',
          style: 'destructive',
          onPress: async () => {
            try {
              const userEmail = auth?.currentUser?.email;
              if (!userEmail) throw new Error('You are not authenticated.');
              const chatRef = doc(database, 'chats', chatId);
              const chatDoc = await getDoc(chatRef);
              if (!chatDoc.exists()) throw new Error('Chat not found.');

              const users = chatDoc.data().users || [];
              const updatedUsers = users.map(user =>
                user.email === userEmail ? { ...user, deletedFromChat: true } : user
              );

              await setDoc(chatRef, { users: updatedUsers }, { merge: true });

              // If all users marked deleted, remove chat completely
              const hasAllDeleted = updatedUsers.every(user => user.deletedFromChat);
              if (hasAllDeleted) await deleteDoc(chatRef);

              // Go back after deletion
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <Menu>
      <MenuTrigger>
        <Ionicons name="ellipsis-vertical" size={25} color="#373737" style={styles.menuIcon} />
      </MenuTrigger>
      <MenuOptions customStyles={menuOptionsStyles}>
        <MenuOption
          onSelect={() => navigation.navigate('ChatInfo', { chatId, chatName })}
          style={styles.optionRow}
        >
          <Ionicons name="information-circle-outline" size={20} color="#008069" style={styles.optionIcon} />
          <Text style={styles.optionText}>Chat Info</Text>
        </MenuOption>
        <MenuOption
          onSelect={handleDeleteChat}
          style={styles.optionRow}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" style={styles.optionIcon} />
          <Text style={[styles.optionText, { color: '#FF3B30' }]}>Delete Chat</Text>
        </MenuOption>

        <MenuOption
          onSelect={() => Alert.alert('Feature coming soon')}
          style={styles.optionRow}
        >
          <Ionicons name="volume-mute-outline" size={20} color="#373737" style={styles.optionIcon} />
          <Text style={styles.optionText}>Mute Chat</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  menuIcon: {
    marginRight: 12,
    padding: 4,
  },
  optionIcon: {
    marginRight: 18,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  optionText: {
    color: '#373737',
    fontSize: 16,
    fontWeight: '500',
  },
});

const menuOptionsStyles = {
  optionsContainer: {
    borderRadius: 12,
    paddingVertical: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.11,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    minWidth: 185,
  },
  optionWrapper: {
    backgroundColor: 'transparent',
  },
};

ChatMenu.propTypes = {
  chatName: PropTypes.string.isRequired,
  chatId: PropTypes.string.isRequired,
};

export default ChatMenu;