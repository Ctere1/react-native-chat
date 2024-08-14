import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { colors } from '../config/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { database } from '../config/firebase';
import Cell from '../components/Cell';

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
                    Alert.alert("Error", "Chat does not exist");
                }
            } catch (error) {
                Alert.alert("Error", "An error occurred while fetching chat info");
                console.error("Error fetching chat info: ", error);
            }
        };

        fetchChatInfo();
    }, [chatId]);

    const renderUser = ({ item }) => (
        <View style={styles.userContainer}>
            <Ionicons name="person-outline" size={30} color="black" />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
            </View>
        </View>
    );

    const uniqueUsers = Array.from(new Map(users.map(user => [user.email, user])).values());

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
                        <Text style={styles.groupLabel}>Group🔹</Text>
                        <Text style={styles.chatTitle}>{chatName}</Text>
                    </>
                ) : (
                    <Text style={styles.chatTitle}>{chatName}</Text>
                )}
            </View>

            <Cell
                title="About"
                subtitle="Available"
                icon="information-outline"
                iconColor="black"
                secondIcon=""
                style={{ marginBottom: 5 }}
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
    container: {
        flex: 1,
    },
    subtitle: {
        marginTop: 2,
        color: '#565656',
    },
    avatar: {
        width: 168,
        height: 168,
        borderRadius: 84,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: colors.primary,
    },
    avatarLabel: {
        fontSize: 20,
        color: 'white',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    groupLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: '#555',
        marginRight: 8,
    },
    usersTitle: {
        padding: 16,
        marginTop: 12,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
    chatTitle: {
        fontSize: 18,
        fontWeight: '500',
        alignSelf: 'center',
        color: '#555',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#000',
    },
    usersList: {
        marginTop: 10,
    },
    userInfo: {
        marginLeft: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    userEmail: {
        fontSize: 14,
        color: '#555',
    },
});

export default ChatInfo;
