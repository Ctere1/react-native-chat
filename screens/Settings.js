import React from "react";
import { Text, View, StyleSheet } from "react-native";
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
                onPress={onSignOut}
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
