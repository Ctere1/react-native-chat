import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { colors } from "../config/constants";
import { auth } from '../config/firebase';
import Cell from "../components/Cell";

const Profile = () => {

    const handleChangeName = () => {
        Alert.alert('Change Name', 'This feature is coming soon.');
    };

    const handleDisplayEmail = () => {
        Alert.alert('Display Email', `Your email is: ${auth?.currentUser?.email}`);
    };

    const handleChangeProfilePicture = () => {
        Alert.alert('Change Profile Picture', 'This feature is coming soon.');
    };

    const handleShowProfilePicture = () => {
        Alert.alert('Show Profile Picture', 'This feature is coming soon.');
    };

    const initials = auth?.currentUser?.displayName
        ? auth.currentUser.displayName.split(' ').map(name => name[0]).join('')
        : auth?.currentUser?.email?.charAt(0).toUpperCase();

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
                <TouchableOpacity style={styles.avatar} onPress={handleShowProfilePicture}>
                    <Text style={styles.avatarLabel}>{initials}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraIcon} onPress={handleChangeProfilePicture}>
                    <Ionicons name="camera-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* User Info Cells */}
            <View style={styles.infoContainer}>
                <Cell
                    title='Name'
                    icon='person-outline'
                    iconColor="black"
                    subtitle={auth?.currentUser?.displayName || "No name set"}
                    secondIcon='pencil-outline'
                    onPress={handleChangeName}
                    style={styles.cell}
                />

                <Cell
                    title='Email'
                    subtitle={auth?.currentUser?.email}
                    icon='mail-outline'
                    iconColor="black"
                    secondIcon='pencil-outline'
                    onPress={handleDisplayEmail}
                    style={styles.cell}
                />

                <Cell
                    title='About'
                    subtitle='Available'
                    icon='information-circle-outline'
                    iconColor="black"
                    secondIcon='pencil-outline'
                    onPress={() => Alert.alert('About', 'This feature is coming soon.')}
                    style={styles.cell}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    avatarLabel: {
        fontSize: 36,
        color: 'white',
        fontWeight: 'bold',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.teal,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    infoContainer: {
        marginTop: 40,
        width: '90%',
    },
    cell: {
        marginBottom: 15,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 0.5,
    },
});

export default Profile;
