import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons'
import { colors } from "../config/constants";
import { auth } from '../config/firebase';
import Cell from "../components/Cell";

const Profile = () => {
    const changePP = () => {
        alert('Change PP');
    };

    const showPP = () => {
        alert('Show PP');
    };

    return (
        <SafeAreaView>
            <TouchableOpacity style={styles.avatar} onPress={showPP}>
                <View>
                    <Text style={styles.avatarLabel}>
                        {
                            auth?.currentUser?.displayName != ''
                                ?
                                auth?.currentUser?.displayName.split(' ').reduce((prev, current) => `${prev}${current[0]}`, '')
                                :
                                auth?.currentUser?.email.split(' ').reduce((prev, current) => `${prev}${current[0]}`, '')
                        }
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer} onPress={changePP}>
                <Ionicons name="camera-outline" size={30} color='white' />
            </TouchableOpacity>

            <Cell
                title='Name'
                icon='person-outline'
                subtitle={auth?.currentUser?.displayName}
                tintColor={colors.grey}
                secondIcon='pencil-outline'
                style={{ top: -36, marginBottom: 5 }} />

            <Cell
                title='Email'
                subtitle={auth?.currentUser?.email}
                icon='mail-outline'
                tintColor={colors.grey}
                secondIcon='pencil-outline'
                style={{ marginTop: -36, marginBottom: 5 }} />

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    subtitle: {
        marginTop: 2,
        color: '#565656'
    },
    avatar: {
        marginTop: 12,
        marginStart: 112,
        width: 168,
        height: 168,
        borderRadius: 84,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary
    },
    avatarLabel: {
        fontSize: 20,
        color: 'white'
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: colors.teal,
        marginStart: 224,
        bottom: 56,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
})
export default Profile;