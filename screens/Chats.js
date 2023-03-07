import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, ScrollView } from "react-native";
import ContactRow from '../components/ContactRow';
import Separator from "../components/Separator";
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../config/firebase';
import { collection, doc, where, query, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'
import { colors } from "../config/constants";

const Chats = () => {
    const navigation = useNavigation();
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const collectionRef = collection(database, 'chats');
        const q = query(collectionRef, where('users', "array-contains", { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName }));
        onSnapshot(q, (doc) => {
            setChats(doc.docs);
        });
    }, []);

    const handleFabPress = () => {
        navigation.navigate('Users');
    }

    return (
        <SafeAreaView style={styles.container}>
            {chats.length === 0 ? (
                <View style={styles.blankContainer} >
                    <Text style={styles.textContainer}>
                        No conversations yet
                    </Text>
                </View>
            ) : (
                <ScrollView>
                    {chats.map(chat => (
                        <React.Fragment key={chat.id}>
                            <ContactRow
                                name={chat.data().users[0].name === auth?.currentUser?.displayName ? chat.data().users[1].name : chat.data().users[0].name}
                                //get first element of users bc first user is current user
                                //TODO check also email
                                //chat.data().users[0].email === auth?.currentUser?.email ? chat.data().users[1].email : chat.data().users[0].email
                                subtitle={chat.data().messages.length === 0 ? "No messages yet" : chat.data().messages[0].text}
                                onPress={() => {
                                    navigation.navigate('Chat', { id: chat.id })
                                }}
                            />
                            <Separator />
                        </React.Fragment>
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                <View style={styles.fabContainer}>
                    <Ionicons name="create" size={24} color={'white'} />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 16,
        right: 16
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
    }
})
export default Chats;