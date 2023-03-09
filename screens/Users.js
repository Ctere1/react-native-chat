import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, StyleSheet, View, Text, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
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
        onSnapshot(q, (doc) => {
            setUsers(doc.docs);
        });

        //Get existing chats to avoid creating duplicate chats
        const collectionChatsRef = collection(database, 'chats');
        const q2 = query(collectionChatsRef,
            where('users', "array-contains", { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false })
        );
        onSnapshot(q2, (doc) => {
            doc.docs.map(existingChat => {
                if (!existingChats.find(e => e.chatId === existingChat.id)) {
                    existingChats.push({ chatId: existingChat.id, userEmails: existingChat.data().users })
                }
            });
            setExistingChats(existingChats);
        });

    }, []);

    const handleNewGroup = () => {
        alert('New group');
    }

    const handleNewUser = () => {
        alert('New user');
    }

    const handleNavigate = async (user) => {
        let navigationChatID = '';
        existingChats.map(existingChat => {
            if (existingChat.userEmails[1].email == user.data().email) {
                navigationChatID = existingChat.chatId;
            }
        });

        if (navigationChatID != '') {
            navigation.navigate('Chat', { id: navigationChatID });
        } else {
            const newRef = doc(collection(database, "chats"));
            await setDoc(newRef, {
                lastUpdated: Date.now(),
                users: [
                    { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false },
                    { email: user.data().email, name: user.data().name, deletedFromChat: false }
                ],
                messages: []
            });
            navigation.navigate('Chat', { id: newRef.id });
        }

    }

    function handleSubtitle(user) {
        if (user.data().email == auth?.currentUser?.email) {
            return 'Message yourself';
        } else {
            return 'User status';
        }
    }

    function handleName(user) {
        if (user.data().name) {
            if (user.data().email == auth?.currentUser?.email) {
                return user.data().name + ('*(You)');
            }
            return user.data().name;
        } else if (user.data().email) {

            return user.data().email;
        } else {
            return '~ No Name or Email ~';
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Cell
                title='New group'
                icon='people'
                tintColor={colors.teal}
                onPress={handleNewGroup}
                style={{ marginTop: 5, marginBottom: 5 }}
            />
            <Cell
                title='New user'
                icon='person-add'
                tintColor={colors.teal}
                onPress={handleNewUser}
                style={{ marginBottom: 10 }}
            />

            {users.length === 0 ? (
                <View style={styles.blankContainer} >
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
                            />
                            <Separator />
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
        fontWeight: 300
    }
})
export default Users;