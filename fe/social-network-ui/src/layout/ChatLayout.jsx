// src/layouts/ChatLayout.jsx

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import ConversationList from '../features/chat/ConversationList';
import { websocketService } from '../service/websocketService';
import '../styles/ChatLayout.css';

const ChatLayout = () => {
    const token = useSelector(state => state.auth.token);
    const currentUser = useSelector(selectCurrentUser);

    useEffect(() => {
        if (token && currentUser) {
            // Connect to WebSocket when entering chat
            websocketService.connect(
                token,
                (frame) => {
                    console.log('WebSocket connected successfully in ChatLayout:', frame);
                },
                (error) => {
                    console.error('WebSocket connection error in ChatLayout:', error);
                }
            );
        }

        // Disconnect when leaving chat
        return () => {
            // Optional: only disconnect if we want to isolate chat connection
            // websocketService.disconnect();
        };
    }, [token, currentUser]);

    return (
        <div className="chat-layout">
            <ConversationList />
            <Outlet />
        </div>
    );
};

export default ChatLayout;