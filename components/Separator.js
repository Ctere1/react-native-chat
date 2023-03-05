import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../config/constants";

const Separator = () => {
    return (
        <View style={styles.separator} />
    )
}

const styles = StyleSheet.create({
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginStart: 88,
        marginEnd: 0
    },
})

export default Separator;
