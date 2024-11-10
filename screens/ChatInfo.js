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
            <Ionicons name="person-outline" size={30} color={colors.primary} />
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
                        <Text style={styles.groupLabel}>Group</Text>
                        <Text style={styles.chatTitle}>{chatName}</Text>
                    </>
                ) : (
                    <Text style={styles.chatTitle}>{chatName}</Text>
                )}
            </View>

            <Cell
                title="About"
                subtitle="Available"
                icon="information-circle-outline"
                iconColor={colors.primary}
                style={styles.cell}
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
        backgroundColor: '#f9f9f9',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: colors.primary,
        marginTop: 20,
        marginBottom: 10,
    },
    avatarLabel: {
        fontSize: 36,
        color: 'white',
        fontWeight: 'bold',
    },
    chatHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    groupLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.primary,
        marginBottom: 4,
    },
    chatTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    cell: {
        marginHorizontal: 16,
        marginBottom: 15,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 0.5,
    },
    usersTitle: {
        marginHorizontal: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userInfo: {
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    usersList: {
        paddingBottom: 20,
    },
});

export default ChatInfo;
