import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons'
import { colors } from "../config/constants";

const ContactRow = ({ name, subtitle, onPress, style, onLongPress, selected, showForwardIcon = true, subtitle2 }) => {
    return (
        <TouchableOpacity style={[styles.row, style]} onPress={onPress} onLongPress={onLongPress}>
            <View style={styles.avatar}>
                <Text style={styles.avatarLabel}>
                    {name.trim().split(' ').reduce((prev, current) => `${prev}${current[0]}`, '')}
                </Text>
            </View>

            <View style={styles.textsContainer}>
                <Text style={styles.name}>
                    {name}
                </Text>
                <Text style={styles.subtitle}>
                    {subtitle}
                </Text>
            </View>

            <View style={styles.textsContainer}>
                <Text style={styles.subtitle2}>
                    {subtitle2}
                </Text>
            </View>

            {selected &&
                <View style={showForwardIcon ? styles.overlay : styles.overlay2}>
                    <Ionicons name="checkmark-outline" size={16} color={'white'} />
                </View>
            }
            {showForwardIcon && <Ionicons name="chevron-forward-outline" size={20} />}

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16
    },
    name: {
        fontSize: 16
    },
    subtitle: {
        marginTop: 2,
        color: '#565656',
        width: 240
    },
    subtitle2: {
        fontSize: 12,
        left: 96,
        color: '#565656',
    },
    textsContainer: {
        flex: 1,
        marginStart: 16
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary
    },
    avatarLabel: {
        fontSize: 20,
        color: 'white'
    },
    overlay: {
        width: 22,
        height: 22,
        backgroundColor: colors.teal,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 1.5,
        top: 18,
        right: 278
    },
    overlay2: {
        width: 22,
        height: 22,
        backgroundColor: colors.teal,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 1.5,
        top: 18,
        right: 298
    },
})

export default ContactRow;