import React from 'react';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

import { auth, database } from '../config/firebase';

const ChatMenu = ({ chatName, chatId }) => {
  const navigation = useNavigation();

  const handleDeleteChat = async () => {
    Alert.alert(
      'Delete this chat?',
      'Messages will be removed from this device.',
      [
        {
          text: 'Delete chat',
          onPress: async () => {
            const chatRef = doc(database, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (chatDoc.exists()) {
              const updatedUsers = chatDoc
                .data()
                .users.map((user) =>
                  user.email === auth?.currentUser?.email
                    ? { ...user, deletedFromChat: true }
                    : user
                );

              await setDoc(chatRef, { users: updatedUsers }, { merge: true });

              const deletedUsers = updatedUsers.filter((user) => user.deletedFromChat).length;
              if (deletedUsers === updatedUsers.length) {
                await deleteDoc(chatRef);
              }
              navigation.goBack();
            }
          },
        },
        { text: 'Cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <Menu>
      <MenuTrigger>
        <Ionicons name="ellipsis-vertical" size={25} color="black" style={{ marginRight: 15 }} />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={() => navigation.navigate('ChatInfo', { chatId, chatName })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <Text style={{ fontWeight: '500' }}>Chat Info</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={() => handleDeleteChat()}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <Text style={{ fontWeight: '500' }}>Delete Chat</Text>
          </View>
        </MenuOption>
        {/* Add more menu options here */}
      </MenuOptions>
    </Menu>
  );
};

ChatMenu.propTypes = {
  chatName: PropTypes.string.isRequired,
  chatId: PropTypes.string.isRequired,
};

export default ChatMenu;
