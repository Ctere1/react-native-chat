import React from 'react';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Text, View, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

import { auth, database } from '../config/firebase';
import { deleteChatForUser } from '../services/chatService';

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

               await deleteChatForUser({
                 chatId,
                 chatData: chatDoc.data(),
                 userEmail,
               });

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
      <MenuTrigger
        customStyles={menuTriggerStyles}
        testID="chat-menu-trigger"
      >
        <View
          accessible
          accessibilityHint="Opens chat actions"
          accessibilityLabel="More chat actions"
          accessibilityRole="button"
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#373737" style={styles.menuIcon} />
        </View>
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
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionText, { color: '#FF3B30' }]}>Delete Chat</Text>
            <Text style={styles.optionSubtitle}>Remove it from your chat list</Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  menuIcon: {
    marginRight: 0,
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
  optionTextContainer: {
    flex: 1,
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

const menuTriggerStyles = {
  TriggerTouchableComponent: TouchableOpacity,
  triggerTouchable: {
    accessibilityHint: 'Opens chat actions',
    accessibilityLabel: 'More chat actions',
    accessibilityRole: 'button',
    hitSlop: { bottom: 6, left: 6, right: 6, top: 6 },
  },
};

ChatMenu.propTypes = {
  chatName: PropTypes.string.isRequired,
  chatId: PropTypes.string.isRequired,
};

export default ChatMenu;
