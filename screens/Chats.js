import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Text, View, TouchableOpacity } from "react-native";
import ContactRow from '../components/ContactRow';
import Separator from "../components/Separator";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { auth, database } from '../config/firebase';
import { collection, doc, where, query, onSnapshot, orderBy, setDoc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from "../config/constants";

const Chats = ({ setUnreadCount }) => {
    const navigation = useNavigation();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const [newMessages, setNewMessages] = useState({});

    useFocusEffect(
        React.useCallback(() => {
            // Load unread messages from AsyncStorage when screen is focused
            const loadNewMessages = async () => {
                try {
                    const storedMessages = await AsyncStorage.getItem('newMessages');
                    const parsedMessages = storedMessages ? JSON.parse(storedMessages) : {};
                    setNewMessages(parsedMessages);
                    setUnreadCount(Object.values(parsedMessages).reduce((total, num) => total + num, 0));
                } catch (error) {
                    console.log('Error loading new messages from storage', error);
                }
            };

            // Set up Firestore listener for chat updates
            const collectionRef = collection(database, 'chats');
            const q = query(
                collectionRef,
                where('users', "array-contains", { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false }),
                orderBy("lastUpdated", "desc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                setChats(snapshot.docs);
                setLoading(false);

                snapshot.docChanges().forEach(change => {
                    if (change.type === "modified") {
                        const chatId = change.doc.id;
                        const messages = change.doc.data().messages;
                        const firstMessage = messages[0];

                        // Increase unread count if the first message is from someone else
                        if (firstMessage.user._id !== auth?.currentUser?.email) {
                            setNewMessages(prev => {
                                const updatedMessages = { ...prev, [chatId]: (prev[chatId] || 0) + 1 };
                                AsyncStorage.setItem('newMessages', JSON.stringify(updatedMessages));
                                setUnreadCount(Object.values(updatedMessages).reduce((total, num) => total + num, 0));
                                return updatedMessages;
                            });
                        }
                    }
                });
            });

            // Load unread messages and start listener when screen is focused
            loadNewMessages();

            // Clean up listener on focus change
            return () => unsubscribe();
        }, [])
    );

    useEffect(() => {
        updateNavigationOptions();
    }, [selectedItems]);

    const updateNavigationOptions = () => {
        if (selectedItems.length > 0) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity style={styles.trashBin} onPress={handleDeleteChat}>
                        <Ionicons name="trash" size={24} color={colors.teal} />
                    </TouchableOpacity>
                ),
                headerLeft: () => (
                    <Text style={styles.itemCount}>{selectedItems.length}</Text>
                ),
            });
        } else {
            navigation.setOptions({
                headerRight: null,
                headerLeft: null,
            });
        }
    };

    const handleChatName = (chat) => {
        const users = chat.data().users;
        const currentUser = auth?.currentUser;

        if (chat.data().groupName) {
            return chat.data().groupName;
        }

        if (currentUser?.displayName) {
            return users[0].name === currentUser.displayName ? users[1].name : users[0].name;
        }

        if (currentUser?.email) {
            return users[0].email === currentUser.email ? users[1].email : users[0].email;
        }

        return '~ No Name or Email ~';
    };

    const handleOnPress = async (chat) => {
        const chatId = chat.id;
        if (selectedItems.length) {
            return selectItems(chat);
        }
        // Reset unread count for the selected chat
        setNewMessages(prev => {
            const updatedMessages = { ...prev, [chatId]: 0 };
            AsyncStorage.setItem('newMessages', JSON.stringify(updatedMessages));
            setUnreadCount(Object.values(updatedMessages).reduce((total, num) => total + num, 0));
            return updatedMessages;
        });
        navigation.navigate('Chat', { id: chat.id, chatName: handleChatName(chat) });
    };

    const handleLongPress = (chat) => {
        selectItems(chat);
    };

    const selectItems = (chat) => {
        if (selectedItems.includes(chat.id)) {
            setSelectedItems(selectedItems.filter(item => item !== chat.id));
        } else {
            setSelectedItems([...selectedItems, chat.id]);
        }
    };

    const getSelected = (chat) => {
        return selectedItems.includes(chat.id);
    };

    const deSelectItems = () => {
        setSelectedItems([]);
    };

    const handleFabPress = () => {
        navigation.navigate('Users');
    };

    const handleDeleteChat = () => {
        Alert.alert(
            selectedItems.length > 1 ? "Delete selected chats?" : "Delete this chat?",
            "Messages will be removed from this device.",
            [
                {
                    text: "Delete chat",
                    onPress: () => {
                        selectedItems.forEach(chatId => {
                            const chat = chats.find(chat => chat.id === chatId);
                            const updatedUsers = chat.data().users.map(user =>
                                user.email === auth?.currentUser?.email
                                    ? { ...user, deletedFromChat: true }
                                    : user
                            );

                            setDoc(doc(database, 'chats', chatId), { users: updatedUsers }, { merge: true });

                            const deletedUsers = updatedUsers.filter(user => user.deletedFromChat).length;
                            if (deletedUsers === updatedUsers.length) {
                                deleteDoc(doc(database, 'chats', chatId));
                            }
                        });
                        deSelectItems();
                    },
                },
                { text: "Cancel" },
            ],
            { cancelable: true }
        );
    };

    const handleSubtitle = (chat) => {
        const message = chat.data().messages[0];
        if (!message) return "No messages yet";

        const isCurrentUser = auth?.currentUser?.email === message.user._id;
        const userName = isCurrentUser ? 'You' : message.user.name.split(' ')[0];
        const messageText = message.image ? 'sent an image' : message.text.length > 20 ? `${message.text.substring(0, 20)}...` : message.text;

        return `${userName}: ${messageText}`;
    };

    const handleSubtitle2 = (chat) => {
        const options = { year: '2-digit', month: 'numeric', day: 'numeric' };
        return new Date(chat.data().lastUpdated).toLocaleDateString(undefined, options);
    };

    return (
        <Pressable style={styles.container} onPress={deSelectItems}>
            {loading ? (
                <ActivityIndicator size='large' style={styles.loadingContainer} />
            ) : (
                <ScrollView>
                    {chats.length === 0 ? (
                        <View style={styles.blankContainer}>
                            <Text style={styles.textContainer}>No conversations yet</Text>
                        </View>
                    ) : (
                        chats.map(chat => (
                            <React.Fragment key={chat.id}>
                                <ContactRow
                                    style={getSelected(chat) ? styles.selectedContactRow : ""}
                                    name={handleChatName(chat)}
                                    subtitle={handleSubtitle(chat)}
                                    subtitle2={handleSubtitle2(chat)}
                                    onPress={() => handleOnPress(chat)}
                                    onLongPress={() => handleLongPress(chat)}
                                    selected={getSelected(chat)}
                                    showForwardIcon={false}
                                    newMessageCount={newMessages[chat.id] || 0}
                                />
                            </React.Fragment>
                        ))
                    )}
                    <Separator />
                    <View style={styles.blankContainer}>
                        <Text style={{ fontSize: 12, margin: 15 }}>
                            <Ionicons name="lock-open" size={12} style={{ color: '#565656' }} /> Your personal messages are not <Text style={{ color: colors.teal }}>end-to-end-encrypted</Text>
                        </Text>
                    </View>
                </ScrollView>
            )}
            <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                <View style={styles.fabContainer}>
                    <Ionicons name="chatbox-ellipses" size={24} color={'white'} />
                </View>
            </TouchableOpacity>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 12,
        right: 12
    },
    fabContainer: {
        width: 56,
        height: 56,
        backgroundColor: colors.teal,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1
    },
    blankContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        fontSize: 16
    },
    selectedContactRow: {
        backgroundColor: '#E0E0E0'
    },
    trashBin: {
        right: 12,
        color: colors.teal,
    },
    itemCount: {
        left: 100,
        color: colors.teal,
        fontSize: 18,
        fontWeight: "400",
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.teal
    },
    newMessageBadge: {
        backgroundColor: colors.teal,
        color: 'white',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        fontSize: 12,
        marginLeft: 8
    }
});

export default Chats;