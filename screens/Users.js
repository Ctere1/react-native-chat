import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, StyleSheet, View, Text, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import ContactRow from '../components/ContactRow';
import Separator from "../components/Separator";
import { auth, database } from '../config/firebase';
import { collection, doc, onSnapshot, setDoc, query, orderBy, where } from 'firebase/firestore';
import { colors } from "../config/constants";
import Cell from "../components/Cell";

const Users = () => {
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);
    const [existingChats, setExistingChats] = useState([]);

    useEffect(() => {
        const collectionUserRef = collection(database, 'users');
        const q = query(collectionUserRef, orderBy("name", "asc"));
        const unsubscribeUsers = onSnapshot(q, (snapshot) => {
            setUsers(snapshot.docs);
        });

        // Get existing chats to avoid creating duplicate chats
        const collectionChatsRef = collection(database, 'chats');
        const q2 = query(
            collectionChatsRef,
            where('users', "array-contains", { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false }),
            where('groupName', "==", '')
        );
        const unsubscribeChats = onSnapshot(q2, (snapshot) => {
            const existing = snapshot.docs.map(existingChat => ({
                chatId: existingChat.id,
                userEmails: existingChat.data().users
            }));
            setExistingChats(existing);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeChats();
        };
    }, []);

    const handleNewGroup = useCallback(() => {
        navigation.navigate('Group');
    }, [navigation]);

    const handleNewUser = useCallback(() => {
        alert('New user');
    }, []);

    const handleNavigate = useCallback((user) => {
        let navigationChatID = '';
        let messageYourselfChatID = '';

        existingChats.forEach(existingChat => {
            const isCurrentUserInTheChat = existingChat.userEmails.some(e => e.email === auth?.currentUser?.email);
            const isMessageYourselfExists = existingChat.userEmails.filter(e => e.email === user.data().email).length;

            if (isCurrentUserInTheChat && existingChat.userEmails.some(e => e.email === user.data().email)) {
                navigationChatID = existingChat.chatId;
            }

            if (isMessageYourselfExists === 2) {
                messageYourselfChatID = existingChat.chatId;
            }

            if (auth?.currentUser?.email === user.data().email) {
                navigationChatID = '';
            }
        });

        if (messageYourselfChatID) {
            navigation.navigate('Chat', { id: messageYourselfChatID, chatName: handleName(user) });
        } else if (navigationChatID) {
            navigation.navigate('Chat', { id: navigationChatID, chatName: handleName(user) });
        } else {
            // Creates new chat
            const newRef = doc(collection(database, "chats"));
            setDoc(newRef, {
                lastUpdated: Date.now(),
                groupName: '', // It is not a group chat
                users: [
                    { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false },
                    { email: user.data().email, name: user.data().name, deletedFromChat: false }
                ],
                lastAccess: [
                    { email: auth?.currentUser?.email, date: Date.now() },
                    { email: user.data().email, date: '' }
                ],
                messages: []
            }).then(() => {
                navigation.navigate('Chat', { id: newRef.id, chatName: handleName(user) });
            });
        }
    }, [existingChats, navigation]);

    const handleSubtitle = useCallback((user) => {
        return user.data().email === auth?.currentUser?.email ? 'Message yourself' : 'User status';
    }, []);

    const handleName = useCallback((user) => {
        const name = user.data().name;
        const email = user.data().email;
        if (name) {
            return email === auth?.currentUser?.email ? `${name}*(You)` : name;
        }
        return email ? email : '~ No Name or Email ~';
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Cell
                title='New group'
                icon='people'
                tintColor={colors.teal}
                onPress={handleNewGroup}
                style={{ marginTop: 5 }}
            />
            <Cell
                title='New user'
                icon='person-add'
                tintColor={colors.teal}
                onPress={handleNewUser}
                style={{ marginBottom: 10 }}
            />

            {users.length === 0 ? (
                <View style={styles.blankContainer}>
                    <Text style={styles.textContainer}>
                        No registered users yet
                    </Text>
                </View>
            ) : (
                <ScrollView>
                    <View>
                        <Text style={styles.textContainer}>
                            Registered users
                        </Text>
                    </View>
                    {users.map(user => (
                        <React.Fragment key={user.id}>
                            <ContactRow
                                name={handleName(user)}
                                subtitle={handleSubtitle(user)}
                                onPress={() => handleNavigate(user)}
                                showForwardIcon={false}
                            />
                        </React.Fragment>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    blankContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: "300",
    }
});

export default Users;