import React from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { colors } from "../config/constants";
import Separator from "../components/Separator";
import Cell from "../components/Cell";
import { deleteUser, signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { deleteDoc, doc } from "firebase/firestore";

const Account = ({ navigation }) => {

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    const deleteAccount = () => {
        deleteUser(auth?.currentUser).catch(error => console.log('Error deleting: ', error));
        deleteDoc(doc(database, 'users', auth?.currentUser.email));
    };

    return (
        <View>
            <Cell
                title='Blocked Users'
                icon='close-circle-outline'
                tintColor={colors.primary}
                onPress={() => {
                    alert('Blocked users touched')
                }}
                style={{ marginTop: 20 }}
            />
            <Cell
                title='Logout'
                icon='log-out-outline'
                tintColor={colors.grey}
                onPress={() => {
                    Alert.alert('Logout?', 'You have to login again',
                        [
                            {
                                text: "Logout",
                                onPress: () => { onSignOut() },
                            },
                            {
                                text: "Cancel",
                            },
                        ],
                        { cancelable: true })
                }}
                showForwardIcon={false}
            />
            <Cell
                title='Delete my account'
                icon='trash-outline'
                tintColor={colors.red}
                onPress={() => {
                    Alert.alert('Delete account?', 'Deleting your account will erase your message history',
                        [
                            {
                                text: "Delete my account",
                                onPress: () => { deleteAccount() },
                            },
                            {
                                text: "Cancel",
                            },
                        ],
                        { cancelable: true })
                }}
                showForwardIcon={false}
                style={{ marginTop: 20 }}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    contactRow: {
        backgroundColor: 'white',
        marginTop: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border
    }
})

export default Account;
