import PropTypes from 'prop-types';
import uuid from 'react-native-uuid';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import EmojiModal from 'react-native-emoji-modal';
import React, { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { Send, Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import { ref, getStorage, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import {
  View,
  Keyboard,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { colors } from '../config/constants';
import { auth, database } from '../config/firebase';

const RenderLoadingUpload = () => (
  <View style={styles.loadingContainerUpload}>
    <ActivityIndicator size="large" color={colors.teal} />
  </View>
);

const RenderLoading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.teal} />
  </View>
);

const RenderBubble = (props) => (
  <Bubble
    {...props}
    wrapperStyle={{
      right: { backgroundColor: colors.primary },
      left: { backgroundColor: 'lightgrey' },
    }}
  />
);

const RenderAttach = (props) => (
  <TouchableOpacity {...props} style={styles.addImageIcon}>
    <View>
      <Ionicons name="attach-outline" size={32} color={colors.teal} />
    </View>
  </TouchableOpacity>
);

const RenderInputToolbar = (props, handleEmojiPanel) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      backgroundColor: 'white',
    }}
  >
    <InputToolbar
      {...props}
      renderActions={() => RenderActions(handleEmojiPanel)}
      containerStyle={styles.inputToolbar}
    />
    <Send {...props}>
      <View style={styles.sendIconContainer}>
        <Ionicons name="send" size={24} color={colors.teal} />
      </View>
    </Send>
  </View>
);

const RenderActions = (handleEmojiPanel) => (
  <TouchableOpacity style={styles.emojiIcon} onPress={handleEmojiPanel}>
    <View>
      <Ionicons name="happy-outline" size={32} color={colors.teal} />
    </View>
  </TouchableOpacity>
);

function Chat({ route }) {
  const [messages, setMessages] = useState([]);
  const [modal, setModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(database, 'chats', route.params.id), (document) => {
      setMessages(
        document.data().messages.map((message) => ({
          ...message,
          createdAt: message.createdAt.toDate(),
          image: message.image ?? '',
        }))
      );
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      //  Dismiss the keyboard
      Keyboard.dismiss();
      //  If the emoji panel is open, close it
      if (modal) {
        setModal(false);
        return true;
      }
      return false;
    });

    //  Dismiss the emoji panel when the keyboard is shown
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      if (modal) setModal(false);
    });

    // Cleanup
    return () => {
      unsubscribe();
      backHandler.remove();
      keyboardDidShowListener.remove();
    };
  }, [route.params.id, modal]);

  const onSend = useCallback(
    async (m = []) => {
      // Get messages
      const chatDocRef = doc(database, 'chats', route.params.id);
      const chatDocSnap = await getDoc(chatDocRef);

      const chatData = chatDocSnap.data();
      const data = chatData.messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toDate(),
        image: message.image ?? '',
      }));

      // Attach new message
      const messagesWillSend = [{ ...m[0], sent: true, received: false }];
      const chatMessages = GiftedChat.append(data, messagesWillSend);

      setDoc(
        doc(database, 'chats', route.params.id),
        {
          messages: chatMessages,
          lastUpdated: Date.now(),
        },
        { merge: true }
      );
    },
    [route.params.id]
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      await uploadImageAsync(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri) => {
    setUploading(true);
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError('Network request failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const randomString = uuid.v4();
    const fileRef = ref(getStorage(), randomString);
    const uploadTask = uploadBytesResumable(fileRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        // Handle unsuccessful uploads
        console.log(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setUploading(false);
        onSend([
          {
            _id: randomString,
            createdAt: new Date(),
            text: '',
            image: downloadUrl,
            user: {
              _id: auth?.currentUser?.email,
              name: auth?.currentUser?.displayName,
              avatar: 'https://i.pravatar.cc/300',
            },
          },
        ]);
      }
    );
  };

  const handleEmojiPanel = useCallback(() => {
    setModal((prevModal) => {
      if (prevModal) {
        // If the modal is already open, close it
        Keyboard.dismiss();
        return false;
      }
      // If the modal is closed, open it
      Keyboard.dismiss();
      return true;
    });
  }, []);

  return (
    <>
      {uploading && RenderLoadingUpload()}
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={(messagesArr) => onSend(messagesArr)}
        imageStyle={{ height: 212, width: 212 }}
        messagesContainerStyle={{ backgroundColor: '#fff' }}
        textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
        user={{
          _id: auth?.currentUser?.email,
          name: auth?.currentUser?.displayName,
          avatar: 'https://i.pravatar.cc/300',
        }}
        renderBubble={(props) => RenderBubble(props)}
        renderSend={(props) => RenderAttach({ ...props, onPress: pickImage })}
        renderUsernameOnMessage
        renderAvatarOnTop
        renderInputToolbar={(props) => RenderInputToolbar(props, handleEmojiPanel)}
        minInputToolbarHeight={56}
        scrollToBottom
        onPressActionButton={handleEmojiPanel}
        scrollToBottomStyle={styles.scrollToBottomStyle}
        renderLoading={RenderLoading}
      />

      {modal && (
        <EmojiModal
          onPressOutside={handleEmojiPanel}
          modalStyle={styles.emojiModal}
          containerStyle={styles.emojiContainerModal}
          backgroundStyle={styles.emojiBackgroundModal}
          columns={5}
          emojiSize={66}
          activeShortcutColor={colors.primary}
          onEmojiSelected={(emoji) => {
            onSend([
              {
                _id: uuid.v4(),
                createdAt: new Date(),
                text: emoji,
                user: {
                  _id: auth?.currentUser?.email,
                  name: auth?.currentUser?.displayName,
                  avatar: 'https://i.pravatar.cc/300',
                },
              },
            ]);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  addImageIcon: {
    borderRadius: 16,
    bottom: 8,
    height: 32,
    width: 32,
  },
  emojiBackgroundModal: {},
  emojiContainerModal: {
    height: 348,
    width: 396,
  },
  emojiIcon: {
    borderRadius: 16,
    bottom: 8,
    height: 32,
    marginLeft: 4,
    width: 32,
  },
  emojiModal: {},
  inputToolbar: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: colors.grey,
    borderRadius: 22,
    borderWidth: 0.5,
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainerUpload: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 999,
  },
  scrollToBottomStyle: {
    borderColor: colors.grey,
    borderRadius: 28,
    borderWidth: 1,
    bottom: 12,
    height: 56,
    position: 'absolute',
    right: 12,
    width: 56,
  },
  sendIconContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: colors.grey,
    borderRadius: 22,
    borderWidth: 0.5,
    height: 44,
    justifyContent: 'center',
    marginRight: 8,
    width: 44,
  },
});

Chat.propTypes = {
  route: PropTypes.object.isRequired,
};

export default Chat;
