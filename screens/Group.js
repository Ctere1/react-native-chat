import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { colors } from "../config/constants";
import { auth, database } from '../config/firebase';
import { useNavigation } from "@react-navigation/native";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import ContactRow from "../components/ContactRow";
import { Ionicons } from '@expo/vector-icons';

const Group = () => {
    const navigation = useNavigation();
    const [selectedItems, setSelectedItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [groupName, setGroupName] = useState("");

    useEffect(() => {
        const collectionUserRef = collection(database, 'users');
        const q = query(collectionUserRef, orderBy("name", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUsers(snapshot.docs);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                selectedItems.length > 0 && <Text style={styles.itemCount}>{selectedItems.length}</Text>
            ),
        });
    }, [selectedItems]);

    const handleName = (user) => {
        if (user.data().name) {
            return user.data().email === auth?.currentUser?.email ? `${user.data().name}*(You)` : user.data().name;
        }
        return user.data().email ? user.data().email : '~ No Name or Email ~';
    }

    const handleSubtitle = (user) => {
        return user.data().email === auth?.currentUser?.email ? 'Message yourself' : 'User status';
    }

    const handleOnPress = (user) => {
        selectItems(user);
    }

    const selectItems = (user) => {
        setSelectedItems((prevItems) => {
            if (prevItems.includes(user.id)) {
                return prevItems.filter(item => item !== user.id);
            }
            return [...prevItems, user.id];
        });
    }

    const getSelected = (user) => selectedItems.includes(user.id);

    const deSelectItems = () => {
        setSelectedItems([]);
    };

    const handleFabPress = () => {
        setModalVisible(true);
    }

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            alert('Group name cannot be empty');
            return;
        }

        const usersToAdd = users
            .filter(user => selectedItems.includes(user.id))
            .map(user => ({ email: user.data().email, name: user.data().name, deletedFromChat: false }));

        usersToAdd.unshift({ email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false });

        const newRef = doc(collection(database, "chats"));
        setDoc(newRef, {
            lastUpdated: Date.now(),
            users: usersToAdd,
            messages: [],
            groupName: groupName,
            groupAdmins: [auth?.currentUser?.email]
        }).then(() => {
            navigation.navigate('Chat', { id: newRef.id, chatName: groupName });
            deSelectItems();
            setModalVisible(false);
            setGroupName("");
        });
    }

    return (
        <Pressable style={styles.container} onPress={deSelectItems}>
            {users.length === 0 ? (
                <View style={styles.blankContainer}>
                    <Text style={styles.textContainer}>No registered users yet</Text>
                </View>
            ) : (
                <ScrollView>
                    {users.map(user => (
                        user.data().email !== auth?.currentUser?.email &&
                        <React.Fragment key={user.id}>
                            <ContactRow
                                style={getSelected(user) ? styles.selectedContactRow : ""}
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
            {selectedItems.length > 0 && (
                <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                    <View style={styles.fabContainer}>
                        <Ionicons name="arrow-forward-outline" size={24} color={'white'} />
                    </View>
                </TouchableOpacity>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Enter Group Name</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setGroupName}
                        value={groupName}
                        placeholder="Group Name"
                        onSubmitEditing={handleCreateGroup} // Create group on submit
                    />
                </View>
            </Modal>
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
    selectedContactRow: {
        backgroundColor: '#E0E0E0'
    },
    itemCount: {
        right: 10,
        color: colors.teal,
        fontSize: 18,
        fontWeight: "400",
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        width: '100%',
        paddingHorizontal: 10
    }
});

export default Group;
