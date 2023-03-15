import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "../config/constants";
import { auth, database } from '../config/firebase';
import { useNavigation } from "@react-navigation/native";
import { collection, doc, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore";
import ContactRow from "../components/ContactRow";
import { Ionicons } from '@expo/vector-icons';

const Group = () => {
    const navigation = useNavigation();
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const collectionUserRef = collection(database, 'users');
        const q = query(collectionUserRef, orderBy("name", "asc"));
        onSnapshot(q, (doc) => {
            setUsers(doc.docs);
        });
    });

    useEffect(() => {
        // SELECTED USERS COUNT 
        if (selectedItems.length > 0) {
            navigation.setOptions({
                headerRight: () => (
                    <Text style={styles.itemCount}>
                        {selectedItems.length}
                    </Text>
                ),
            });
        } else {
            navigation.setOptions({
                headerRight: () => { },
            },
            );
        }
    }, [selectedItems]);

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

    function handleSubtitle(user) {
        if (user.data().email == auth?.currentUser?.email) {
            return 'Message yourself';
        } else {
            return 'User status';
        }
    }

    const handleOnPress = (user) => {
        selectItems(user);
    }

    const selectItems = (user) => {
        if (selectedItems.includes(user.id)) {
            const newListItems = selectedItems.filter(
                listItem => listItem !== user.id,
            );
            return setSelectedItems([...newListItems]);
        }
        setSelectedItems([...selectedItems, user.id]);

        if (selectedUsers.includes(user.id)) {
            const newListItems = selectedItems.filter(
                listItem => listItem !== user.id,
            );
            return setSelectedItems([...newListItems]);
        }
        setSelectedUsers([...selectedUsers, user]);
    }

    const getSelected = (user) => {
        return selectedItems.includes(user.id);
    }

    const deSelectItems = () => {
        setSelectedItems([]);
        setSelectedUsers([]);
    };

    const handleFabPress = () => {
        let users = [];
        //Add admin first to group
        users.push({ email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false });
        selectedUsers.map(user => {
            //Add other users
            users.push({ email: user.data().email, name: user.data().name, deletedFromChat: false });
        })
        //Creates new Group chat
        const groupName = 'GROUP ' + Math.floor(Math.random() * 10) + '🌍';
        const newRef = doc(collection(database, "chats"));
        setDoc(newRef, {
            lastUpdated: Date.now(),
            users: users,
            messages: [],
            groupName: groupName, //TODO admin can set group name
            groupAdmins: [auth?.currentUser?.email] //TODO can change group admins later
        }).then(
            navigation.navigate('Chat', { id: newRef.id, chatName: groupName })
        );
        deSelectItems();
    }

    return (
        <Pressable style={styles.container} onPress={deSelectItems}>
            {users.length === 0 ? (
                <View style={styles.blankContainer} >
                    <Text style={styles.textContainer}>
                        No registered users yet
                    </Text>
                </View>
            ) : (
                <ScrollView>
                    {users.map(user =>
                    (
                        user.data().email != auth?.currentUser?.email &&

                        <React.Fragment key={user.id}>
                            <ContactRow style={getSelected(user) ? styles.selectedContactRow : ""}
                                name={handleName(user)}
                                subtitle={handleSubtitle(user)}
                                onPress={() => handleOnPress(user)}
                                selected={getSelected(user)}
                                showForwardIcon={false}
                            />
                        </React.Fragment>
                    ))}
                </ScrollView>
            )}

            {selectedItems.length > 0 &&
                <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                    <View style={styles.fabContainer}>
                        <Ionicons name="arrow-forward-outline" size={24} color={'white'} />
                    </View>
                </TouchableOpacity>
            }

        </Pressable>
    )
}

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
    textContainer: {
        fontSize: 16
    },
    blankContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactRow: {
        backgroundColor: 'white',
        marginTop: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border
    },
    itemCount: {
        right: 10,
        color: colors.teal,
        fontSize: 18,
        fontWeight: 400,
    }
})

export default Group;