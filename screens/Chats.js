import React, {
    useState, useEffect, useLayoutEffect, useCallback
} from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ContactRow from '../components/ContactRow';
import Separator from "../components/Separator";
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../config/firebase';
import { collection, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';

const Chats = () => {
    const navigation = useNavigation();
 

    return (
        <SafeAreaView>

            <ContactRow
                name={'User'}
                subtitle='{message.text}'
                onPress={() => {
                    navigation.navigate('Chat')
                }}
            />
            <Separator />
            <ContactRow
                name={'Test User'}
                subtitle='{message.text}'
                onPress={() => {
                    navigation.navigate('Chat')
                }}
            />
            <Separator />
            <ContactRow
                name={'Cemil Tan'}
                subtitle='{message.text}'
                onPress={() => {
                    navigation.navigate('Chat')
                }}
            />
            <Separator />


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
export default Chats;