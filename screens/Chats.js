import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, ScrollView, Pressable, BackHandler, Alert, ActivityIndicator } from "react-native";
import ContactRow from '../components/ContactRow';
import Separator from "../components/Separator";
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../config/firebase';
import { collection, doc, where, query, onSnapshot, orderBy, setDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'
import { colors } from "../config/constants";

const Chats = () => {
    const navigation = useNavigation();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastAccess, setLastAccess] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        const collectionRef = collection(database, 'chats');
        const q = query(collectionRef,
            where('users', "array-contains", { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName, deletedFromChat: false }),
            orderBy("lastUpdated", "desc")
        );
        const unsubscribe = onSnapshot(q, (doc) => {
            if (doc.docs.length == 0) {
                setLoading(false);
            }
            setChats(doc.docs);
        });

        // DELETE BUTTON 
        if (selectedItems.length > 0) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity style={styles.trashBin} onPress={handleDeleteChat}>
                        <View>
                            <Ionicons name="trash" size={24} color={colors.teal} />
                        </View>
                    </TouchableOpacity>
                ),
                headerLeft: () => (
                    <Text style={styles.itemCount}>
                        {selectedItems.length}
                    </Text>
                ),
            });
        } else {
            navigation.setOptions({
                headerRight: () => { },
                headerLeft: () => { },
            },
            );
        }

        return () => unsubscribe();
    }, [selectedItems]);

    
    const handleChatName = (chat) => {
        if (chat.data().groupName) {
            return chat.data().groupName;
        } else if (auth?.currentUser?.displayName) {
            if (auth?.currentUser?.displayName === chat.data().users[0].name) {
                //For 'message yourself'
                if (auth?.currentUser?.displayName === chat.data().users[0].name && auth?.currentUser?.displayName === chat.data().users[1].name) {
                    return auth?.currentUser?.displayName + '*(You)';
                }
                return chat.data().users[1].name;
            } else if (auth?.currentUser?.displayName === chat.data().users[1].name) {
                return chat.data().users[0].name;
            }
        } else if (auth?.currentUser?.email) {
            if (auth?.currentUser?.email === chat.data().users[0].email) {
                //For 'message yourself'
                if (auth?.currentUser?.email === chat.data().users[0].email && auth?.currentUser?.email === chat.data().users[1].email) {
                    return auth?.currentUser?.email + '*(You)';
                }
                return chat.data().users[1].email;
            } else if (auth?.currentUser?.email === chat.data().users[1].email) {
                return chat.data().users[0].email;
            }
        } else {
            return '~ No Name or Email ~';
        }
    }

    const handleOnPress = (chat) => {
        if (selectedItems.length) {
            return selectItems(chat)
        }
        navigation.navigate('Chat', { id: chat.id, chatName: handleChatName(chat) })

        //TODO CHECK THIS
        // //SET LAST ACCESS TO CHAT FOR EACH USER
        // onSnapshot(doc(database, 'chats', chat.id), (doc) => {
        //     setLastAccess(doc.data().lastAccess.map((user) => ({
        //         email: user.email,
        //         date: auth?.currentUser?.email == user.email ? Date.now() : user.date,
        //     })));
        // });


        // if (lastAccess.length > 0) {
        //     setDoc(doc(database, 'chats', chat.id), { lastAccess: lastAccess, }, { merge: true });
        // }
    }

    const handleLongPress = (chat) => {
        selectItems(chat);
    }

    const selectItems = (chat) => {
        if (selectedItems.includes(chat.id)) {
            const newListItems = selectedItems.filter(
                listItem => listItem !== chat.id,
            );
            return setSelectedItems([...newListItems]);
        }
        setSelectedItems([...selectedItems, chat.id]);
    }

    const getSelected = (chat) => {
        return selectedItems.includes(chat.id);
    }

    const deSelectItems = () => {
        setSelectedItems([]);
    };

    const handleFabPress = () => {
        navigation.navigate('Users');
    }

    const handleDeleteChat = () => {
        Alert.alert(
            selectedItems.length > 1 ? "Delete selected chats?" : "Delete this chat?",
            "Messages will be removed from this device.",
            [
                // The "Yes" button
                {
                    text: "Delete chat",
                    onPress: () => {
                        //Find the willUpdatedUsers
                        selectedItems.map((chatId) => {
                            let willUpdatedUsers = [];
                            chats.map(chat => {
                                if (chatId == chat.id) {

                                    willUpdatedChat = chat;
                                    chat.data().users.map(user => {
                                        if (user.email == auth?.currentUser?.email) {
                                            willUpdatedUsers.push({ email: user.email, name: user.name, deletedFromChat: true })
                                        } else {
                                            willUpdatedUsers.push({ email: user.email, name: user.name, deletedFromChat: user.deletedFromChat })
                                        }
                                    })
                                }
                            })
                            //Remove the current user from chat
                            setDoc(doc(database, 'chats', chatId), {
                                users: willUpdatedUsers
                            }, { merge: true });
                            //if nobody left in chat, delete the entire chat
                            let deletedFromChatUsers = 0;
                            willUpdatedUsers.forEach(user => {
                                if (user.deletedFromChat) {
                                    deletedFromChatUsers++;
                                }
                            })
                            if (willUpdatedUsers.length == deletedFromChatUsers) {
                                deleteDoc(doc(database, 'chats', chatId))
                            }
                        });
                        deSelectItems();
                    },
                },
                // The "Cancel" button
                // Does nothing but dismiss the dialog when tapped
                {
                    text: "Cancel",
                },
            ],
            { cancelable: true }
        );
    }

    const handleSubtitle = (chat) => {
        if (chat.data().messages.length === 0) {
            return "No messages yet";
        } else {
            if (chat.data().groupName != '') { //It is group chat
                if (auth?.currentUser?.email == chat.data().messages[0].user._id) { //Yours message
                    //Check lenght of the last message and add three dot...
                    if (chat.data().messages[0].image && chat.data().messages[0].image != '') {
                        return 'You sent an image';
                    } else if (chat.data().messages[0].text.length > 20) {
                        return 'You: ' + chat.data().messages[0].text.substring(0, 20) + '...';
                    } else {
                        return 'You: ' + chat.data().messages[0].text.substring(0, 20);
                    }
                } else {//Others message
                    //Get first name
                    const firstName = chat.data().messages[0].user.name.substring(0, chat.data().messages[0].user.name.indexOf(' '));
                    //Check lenght of the last message and add three dot...
                    if (chat.data().messages[0].image && chat.data().messages[0].image != '') {
                        return firstName + ' sent an image';
                    } else if (chat.data().messages[0].text.length > 20) {
                        return firstName + ': ' + chat.data().messages[0].text.substring(0, 20) + '...';
                    } else {
                        return firstName + ': ' + chat.data().messages[0].text.substring(0, 20);
                    }
                }
            } else { //It is not group chat
                if (auth?.currentUser?.email == chat.data().messages[0].user._id) { //Yours message
                    //Check lenght of the last message and add three dot...
                    if (chat.data().messages[0].image && chat.data().messages[0].image != '') {
                        return 'You sent an image';
                    } else if (chat.data().messages[0].text.length > 20) {
                        return chat.data().messages[0].text.substring(0, 20) + '...';
                    } else {
                        return chat.data().messages[0].text.substring(0, 20);
                    }
                } else {//Others message
                    //Get first name
                    const firstName = chat.data().messages[0].user.name.substring(0, chat.data().messages[0].user.name.indexOf(' '));
                    //Check lenght of the last message and add three dot...
                    if (chat.data().messages[0].image && chat.data().messages[0].image != '') {
                        return firstName + ' sent an image';
                    } else if (chat.data().messages[0].text.length > 20) {
                        return chat.data().messages[0].text.substring(0, 20) + '...';
                    } else {
                        return chat.data().messages[0].text.substring(0, 20);
                    }
                }
            }
        }
    }

    const handleSubtitle2 = (chat) => {
        const options = { year: '2-digit', month: 'numeric', day: 'numeric' };
        const timestemp = new Date(chat.data().lastUpdated);
        const date = timestemp.toLocaleDateString(undefined, options);
        return date;
    }

    return (
        <Pressable style={styles.container} onPress={deSelectItems}>
            {chats.length === 0 ? (
                <>
                    {loading == true ? (
                        <ActivityIndicator size='large' style={styles.loadingContainer} />
                    ) :
                        (
                            <View style={styles.blankContainer}>
                                <Text style={styles.textContainer}>
                                    No conversations yet
                                </Text>
                            </View>
                        )
                    }
                </>
            ) : (
                <ScrollView >
                    {chats.map(chat => (
                        <React.Fragment key={chat.id}>
                            <ContactRow style={getSelected(chat) ? styles.selectedContactRow : ""}
                                name={handleChatName(chat)}
                                subtitle={handleSubtitle(chat)}
                                subtitle2={handleSubtitle2(chat)}
                                onPress={() => handleOnPress(chat)}
                                onLongPress={() => handleLongPress(chat)}
                                selected={getSelected(chat)}
                                showForwardIcon={false}
                            />
                        </React.Fragment>
                    ))}
                    <Separator />
                    <View style={styles.blankContainer} >
                        <Text style={{ fontSize: 12, fontWeight: 400, marginRight: 15, marginLeft: 15, marginTop: 15, marginBottom: 90 }}>
                            <Ionicons name="lock-open" size={12} style={{ color: '#565656' }} />
                            {' '}Your personal messages are not{' '}
                            <Text style={{ color: colors.teal }}>
                                end-to-end-encrypted
                            </Text>
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
        fontWeight: 400,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.teal
    }
})
export default Chats;