import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard, Text, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons'
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat'
import { auth, database } from '../config/firebase';
import { doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { colors } from '../config/constants';
import EmojiModal from 'react-native-emoji-modal';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';

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
                sent: message.sent,
                received: message.received,
                image: message.image ?? '',
            })));
        });


        return () => unsubscribe();
    }, [route.params.id]);

    const onSend = useCallback((m = []) => {
        const messagesWillSend = [{ ...m[0], sent: true, received: false }];
        setDoc(doc(database, 'chats', route.params.id), { messages: GiftedChat.append(messages, messagesWillSend), lastUpdated: Date.now() }, { merge: true });
    }, [route.params.id, messages]);


    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            // aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            await uploadImageAsync(result.assets[0].uri);
        }
    };

    async function uploadImageAsync(uri) {
        // Why are we using XMLHttpRequest? See:
        // https://github.com/expo/expo/issues/2402#issuecomment-443726662
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });
        const randomString = uuid.v4();
        const fileRef = ref(getStorage(), randomString);
        const result = await uploadBytes(fileRef, blob);

        // We're done with the blob, close and release it
        blob.close();
        const uploadedFileString = await getDownloadURL(fileRef);

        onSend([{
            _id: randomString,
            createdAt: new Date(),
            text: '',
            image: uploadedFileString,
            user: {
                _id: auth?.currentUser?.email,
                name: auth?.currentUser?.displayName,
                avatar: 'https://i.pravatar.cc/300'
            }
        }]);
        // console.log(uploadedFileString);
    }


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
            <>
                <TouchableOpacity style={styles.addImageIcon} onPress={pickImage}>
                    <View>
                        <Ionicons
                            name='attach-outline'
                            size={32}
                            color={colors.teal} />
                    </View>
                </TouchableOpacity>
                <Send {...props}>
                    <View style={{ justifyContent: 'center', height: '100%', marginLeft: 8, marginRight: 4, marginTop: 12 }}>
                        <Ionicons
                            name='send'
                            size={24}
                            color={colors.teal} />
                    </View>
                </Send>
            </>
        )
    }

    function renderInputToolbar(props) {
        return (
            <InputToolbar {...props}
                containerStyle={styles.inputToolbar}
                renderActions={renderActions}
            >
            </InputToolbar >
        )
    }

    function renderActions() {
        return (
            <TouchableOpacity style={styles.emojiIcon} onPress={handleEmojiPanel}>
                <View>
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

    function renderLoading() {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={colors.teal} />
            </View>
        );
    }

    return (
        <>
            <GiftedChat
                messages={messages}
                showAvatarForEveryMessage={false}
                showUserAvatar={false}
                onSend={messages => onSend(messages)}
                imageStyle={{
                    height: 212,
                    width: 212
                }}
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
                minInputToolbarHeight={56}
                scrollToBottom={true}
                onPressActionButton={handleEmojiPanel}
                scrollToBottomStyle={styles.scrollToBottomStyle}
                renderLoading={renderLoading}
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
                        onSend([{
                            _id: uuid.v4(),
                            createdAt: new Date(),
                            text: emoji,
                            user: {
                                _id: auth?.currentUser?.email,
                                name: auth?.currentUser?.displayName,
                                avatar: 'https://i.pravatar.cc/300'
                            }
                        }]);
                        //TODO handle this function. Return new GiftedChat component maybe??
                    }}
                />
            }

        </>
    );
}

const styles = StyleSheet.create({
    inputToolbar: {
        bottom: 6,
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
    },
    addImageIcon: {
        bottom: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default Chat;