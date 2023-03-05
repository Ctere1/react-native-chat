import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../config/constants";

const Button = ({ title, variant }) => {
    return (
        <TouchableOpacity style={[styles.buttonContainer, { backgroundColor: variant === 'primary' ? 'black' : 'transparent' }, { paddingHorizontal: variant === 'primary' ? 18 : 0 }]}>
            <Text style={[styles.buttonLabel, { color: variant === 'primary' ? 'white' : 'black' }]}>
                {title}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        paddingVertical: 12,
        borderRadius: 6
    },
    buttonLabel: {
        fontSize: 18,
    }
})

export default Button;
