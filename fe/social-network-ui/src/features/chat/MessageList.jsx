import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { websocketService } from '../../service/websocketService';
import MessageItem from './MessageItem';
import '../../styles/MessageList.css';

const MessageList = ({ chatRoomId, messages: initialMessages, onNewMessage }) => {
    const currentUser = useSelector(selectCurrentUser);
    const [messages, setMessages] = useState(initialMessages || []);

    // Store onNewMessage in ref to avoid triggering re-subscription
    const onNewMessageRef = useRef(onNewMessage);
    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
    }, [onNewMessage]);

    useEffect(() => {
        // Update messages when initialMessages change
        setMessages(initialMessages || []);
    }, [initialMessages]);

    useEffect(() => {
        if (!chatRoomId) return;

        // Subscribe to chat room for realtime messages
        const subscription = websocketService.subscribeToChatRoom(chatRoomId, (newMessage) => {
            console.log('Received new message:', newMessage);
            setMessages(prev => [...prev, newMessage]);

            // Notify parent to scroll (use ref to avoid stale closure)
            if (onNewMessageRef.current) {
                onNewMessageRef.current();
            }
        });

        // Cleanup subscription when component unmounts or chatRoomId changes
        return () => {
            websocketService.unsubscribeFromChatRoom(chatRoomId);
        };
    }, [chatRoomId]); // Only depend on chatRoomId, not onNewMessage

    if (!messages || messages.length === 0) {
        return (
            <div className="message-list empty">
                <div className="empty-state">
                    <p>No messages yet</p>
                    <p className="empty-hint">Start the conversation!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="message-list">
            {messages.map((msg) => (
                <MessageItem
                    key={msg.id}
                    message={msg}
                    isOwnMessage={msg.senderId === currentUser?.id}
                />
            ))}
        </div>
    );
};

export default MessageList;