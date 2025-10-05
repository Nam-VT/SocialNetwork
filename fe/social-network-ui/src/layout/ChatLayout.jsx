// src/layouts/ChatLayout.jsx

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ConversationList from '../features/chat/ConversationList';
import { websocketService } from '../service/websocketService';

const ChatLayout = () => {
    useEffect(() => {
        websocketService.connect();
        
        // Tự động ngắt kết nối khi người dùng rời khỏi trang chat
        return () => {
            websocketService.disconnect();
        };
    }, []);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', height: 'calc(100vh - 80px)' }}>
            <aside style={{ borderRight: '1px solid #ddd', overflowY: 'auto' }}>
                <ConversationList />
            </aside>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default ChatLayout;