import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard, Text } from "react-native";
import { Ionicons } from '@expo/vector-icons'
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat'
import { auth, database } from '../config/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { colors } from '../config/constants';
import EmojiModal from 'react-native-emoji-modal';
import { useNavigation } from '@react-navigation/native';

function Chat({ route }) {
    const navigation = useNavigation();
    const [messages, setMessages] = useState([]);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(database, 'chats', route.params.id), (doc) => {
            setMessages(doc.data().messages.map((message) => ({
                _id: message._id,
                createdAt: message.createdAt.toDate(),
                text: message.text,
                user: message.user,
                sent: true,
            }))
            );
        });

        //Set Header
        navigation.setOptions({
            headerTitle: route.params.chatName
        });

        return unsubscribe;
    }, [route.params.id]);

    const onSend = useCallback((m = []) => {
        setDoc(doc(database, 'chats', route.params.id), { messages: GiftedChat.append(messages, m), lastUpdated: Date.now() }, { merge: true });
    }, [route.params.id, messages]);

    function renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: colors.primary
                    },
                    left: {
                        backgroundColor: 'lightgrey'
                    }
                }}
            />
        )
    }

    function renderSend(props) {
        return (
            <Send {...props} >
                <View style={{ justifyContent: 'center', height: '100%', marginRight: 4 }}>
                    <Ionicons
                        name='send'
                        size={24}
                        color={colors.teal}
                    />
                </View>
            </Send>
        )
    }

    function renderInputToolbar(props) {
        return (
            <InputToolbar {...props} containerStyle={styles.inputToolbar} renderActions={renderActions} >
            </InputToolbar >
        )
    }

    function renderActions() {
        return (
            <TouchableOpacity style={styles.emojiIcon} onPress={handleEmojiPanel}>
                <View >
                    <Ionicons
                        name='happy-outline'
                        size={32}
                        color={colors.teal} />
                </View>
            </TouchableOpacity>
        )
    }

    function handleEmojiPanel() {
        if (modal) {
            setModal(false);
        } else {
            Keyboard.dismiss();
            setModal(true);
        }
    }

    return (
        <>
            <GiftedChat
                messages={messages}
                showAvatarForEveryMessage={false}
                showUserAvatar={false}
                onSend={messages => onSend(messages)}
                messagesContainerStyle={{
                    backgroundColor: '#fff'
                }}
                textInputStyle={{
                    backgroundColor: '#fff',
                    borderRadius: 20,
                }}
                user={{
                    _id: auth?.currentUser?.email,
                    name: auth?.currentUser?.displayName,
                    avatar: 'https://i.pravatar.cc/300'
                }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderUsernameOnMessage={true}
                renderAvatarOnTop={true}
                renderInputToolbar={renderInputToolbar}
                minInputToolbarHeight={48}
                scrollToBottom={true}
                onPressActionButton={handleEmojiPanel}
                scrollToBottomStyle={styles.scrollToBottomStyle}
            // onInputTextChanged={handleTyping}
            // isTyping={handleTyping}
            // shouldUpdateMessage={() => { return false; }}
            />

            {modal &&
                <EmojiModal
                    onPressOutside={handleEmojiPanel}
                    modalStyle={styles.emojiModal}
                    containerStyle={styles.emojiContainerModal}
                    backgroundStyle={styles.emojiBackgroundModal}
                    columns={5}
                    emojiSize={66}
                    activeShortcutColor={colors.primary}
                    onEmojiSelected={(emoji) => {
                        // console.log(emoji)
                        // setEmojiMessage(emoji)
                        onSend({
                            _id: Math.random(),
                            createdAt: new Date(),
                            text: emoji,
                            user: {
                                _id: auth?.currentUser?.email,
                                name: auth?.currentUser?.displayName,
                                avatar: 'https://i.pravatar.cc/300'
                            }
                        });
                        //TODO handle this function. Return new GiftedChat component maybe??
                    }}
                />
            }

        </>
    );
}

const styles = StyleSheet.create({
    inputToolbar: {
        bottom: 2,
        marginLeft: 8,
        marginRight: 8,
        borderRadius: 16,
    },
    emojiIcon: {
        marginLeft: 4,
        bottom: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    emojiModal: {

    },
    emojiContainerModal: {
        height: 348,
        width: 396,
    },
    emojiBackgroundModal: {

    },
    scrollToBottomStyle: {
        borderColor: colors.grey,
        borderWidth: 2,
        width: 56,
        height: 56,
        borderRadius: 28,
        position: 'absolute',
        bottom: 12,
        right: 12
    }
})

export default Chat;