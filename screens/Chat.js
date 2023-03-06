import React, { useState, useEffect, useCallback } from 'react'
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { auth, database } from '../config/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { colors } from '../config/constants';

function Chat({ route }) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        onSnapshot(doc(database, 'chats', route.params.id), (doc) => {
            setMessages(doc.data().messages.map((message) => ({
                _id: message._id,
                createdAt: message.createdAt.toDate(),
                text: message.text,
                user: message.user
            }))
            );
        });
    }, [route.params.id]);

    const onSend = useCallback((m = []) => {
        setDoc(doc(database, 'chats', route.params.id), { messages: GiftedChat.append(messages, m) }, { merge: true });
    }, [route.params.id, messages]);

    function renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: colors.primary
                    },
                    left: {
                        backgroundColor: 'lightgrey'
                    }
                }}
            />
        )
    }

    return (
        <GiftedChat
            messages={messages}
            showAvatarForEveryMessage={false}
            showUserAvatar={false}
            onSend={messages => onSend(messages)}
            messagesContainerStyle={{
                backgroundColor: '#fff'
            }}
            textInputStyle={{
                backgroundColor: '#fff',
                borderRadius: 20,
            }}
            user={{
                _id: auth?.currentUser?.email,
                avatar: 'https://i.pravatar.cc/300'
            }}
            renderBubble={renderBubble}
        />
    );
}
export default Chat;