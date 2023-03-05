import React from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";

const Profile = ({ navigation }) => {
    return (
        <SafeAreaView>
            <View>
                <Text>Profile Page</Text>
            </View>
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
export default Profile;