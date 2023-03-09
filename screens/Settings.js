import React from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import ContactRow from "../components/ContactRow";
import { colors } from "../config/constants";
import Separator from "../components/Separator";
import Cell from "../components/Cell";
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const Settings = ({ navigation }) => {
    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    return (
        <View>
            <ContactRow
                name={auth?.currentUser?.displayName ?? 'No name'}
                subtitle={auth?.currentUser?.email}
                style={styles.contactRow}
                onPress={() => {
                    navigation.navigate('Profile');
                }}
            />
            <Separator />
            <Cell
                title='Logout'
                icon='log-out-outline'
                tintColor={colors.red}
                onPress={() => {
                    Alert.alert('Logout?', 'You have to login again',
                        [
                            {
                                text: "Logout",
                                onPress: () => { onSignOut },
                            },
                            {
                                text: "Cancel",
                            },
                        ],
                        { cancelable: true })
                }}
                style={{ marginTop: 20 }}
            />

            <Cell
                title='Share App With a Friend'
                icon='heart-outline'
                tintColor={colors.pink}
                onPress={() => {
                    alert('Share touched')
                }}
            />

            <Cell
                title='App info'
                icon='information-circle-outline'
                tintColor={colors.teal}
                onPress={() => {
                    Alert.alert('React Native Chat App', 'Developed by Cemil Tan',
                        [
                            {
                                text: "Ok",
                                onPress: () => { },
                            },
                        ],
                        { cancelable: true })
                }}
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

export default Settings;
