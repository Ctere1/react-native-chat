import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, View, Text, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import ContactRow from '../components/ContactRow';
import Separator from "../components/Separator";
import { auth, database } from '../config/firebase';
import { collection, addDoc, onSnapshot, where, query } from 'firebase/firestore';
import { colors } from "../config/constants";
import Cell from "../components/Cell";

const Users = () => {
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const collectionRef = collection(database, 'users');
        //Self message disabled for now. Maybe will implement later.
        const q = query(collectionRef, where('email', "!=", auth?.currentUser?.email));
        onSnapshot(q, (doc) => {
            setUsers(doc.docs);
        });
    }, []);

    const handleNewGroup = () => {
        alert('New group');
    }

    const handleNewUser = () => {
        alert('New user');
    }

    return (
        <SafeAreaView style={styles.container}>
            <Cell
                title='New group'
                icon='people-outline'
                tintColor={colors.teal}
                onPress={handleNewGroup}
                style={{ marginTop: 5, marginBottom: 5 }}
            />
            <Cell
                title='New user'
                icon='person-add-outline'
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
                                name={user.data().name ?? user.data().email}
                                subtitle={'User Status'}
                                onPress={() => {
                                    addDoc(collection(database, 'chats'), {
                                        users: [
                                            { email: auth?.currentUser?.email, name: auth?.currentUser?.displayName },
                                            { email: user.data().email, name: user.data().name }
                                        ],
                                        messages: []
                                    }).then((doc) => {
                                        navigation.navigate('Chat', { id: doc.id })
                                    })
                                }}
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