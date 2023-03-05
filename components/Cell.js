import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../config/constants";
import { Ionicons } from '@expo/vector-icons'

const Cell = ({ title, icon, tintColor, style, onPress }) => {
    return (
        <TouchableOpacity style={[styles.cell, style]} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: tintColor }]}>
                <Ionicons name={icon} size={24} marginStart={4} color={'white'} />
            </View>
            <Text style={styles.title}>
                {title}
            </Text>
            <Ionicons name='chevron-forward-outline' size={20} />
        </TouchableOpacity >
    )
}

const styles = StyleSheet.create({
    contactRow: {
        backgroundColor: 'white',
        marginTop: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    cell: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    title: {
        fontSize: 16,
        marginStart: 16,
        flex: 1
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 6,
        alignContent: 'center',
        justifyContent: 'center',
    }
})

export default Cell;



