import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, View, TouchableOpacity } from "react-native";
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
        const q = query(collectionRef, where('users', "array-contains", auth?.currentUser?.email));
        onSnapshot(q, (doc) => {
            setChats(doc.docs);
        });
    }, []);

    const handleFabPress = () => {
        navigation.navigate('Users');
    }

    return (
        <SafeAreaView style={styles.container}>
            {chats.map(chat => (
                <React.Fragment key={chat.id}>
                    <ContactRow
                        name={chat.data().users.find((x) => x !== auth?.currentUser?.email)}
                        subtitle={chat.data().messages.length === 0 ? "No messages yet" : chat.data().messages[0].text}
                        onPress={() => {
                            navigation.navigate('Chat', { id: chat.id })
                        }}
                    />
                    <Separator />
                </React.Fragment>
            ))}
            <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                <View style={styles.fabContainer}>
                    <Ionicons name="add" size={24} color={'white'} />
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
        backgroundColor: colors.pink,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1
    },
})
export default Chats;