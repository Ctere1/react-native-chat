import React from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import ContactRow from '../components/ContactRow';
import Separator from "../components/Separator";
import { auth, database } from '../config/firebase';

const Users = ({ navigation }) => {
    const users = [{ id: 1, email: 'test@test.com' }, { id: 2, email: 'test6@test.com' }, { id: 3, email: 'test7@test.com' }, { id: 4, email: 'test8@test.com' }]

    return (
        <SafeAreaView style={styles.container}>
            {users.map(user => (
                <React.Fragment key={user.id}>
                    <ContactRow
                        name={user.email}
                        subtitle={'User Status'}
                        onPress={() => {
                            navigation.navigate('Chat')
                        }}
                    />
                    <Separator />
                </React.Fragment>
            ))}

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#565656',
        marginStart: 88
    },
})
export default Users;