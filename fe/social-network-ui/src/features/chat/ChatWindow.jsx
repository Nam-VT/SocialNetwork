import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { websocketService } from '../../service/websocketService';
import MessageList from './MessageList.jsx';
import ChatHeader from './ChatHeader';
import '../../styles/ChatWindow.css';

const ChatWindow = () => {
    const { chatRoomId } = useParams();
    const [messageContent, setMessageContent] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        const trimmedContent = messageContent.trim();
        if (trimmedContent && chatRoomId) {
            websocketService.sendMessage(chatRoomId, { 
                content: trimmedContent, 
                type: 'TEXT',
                mediaId: null // Để tương thích với logic cũ nếu cần
            });
            setMessageContent('');
        }
    };

    // Xử lý Enter key để gửi message (nếu không phải Shift+Enter)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    if (!chatRoomId) {
        return (
            <div className="chat-window-empty">
                <div className="empty-content">
                    <h3>Select a conversation</h3>
                    <p>Choose a chat from the left sidebar to start messaging.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <ChatHeader chatRoomId={chatRoomId} />
            
            <div className="chat-messages">
                <MessageList chatRoomId={chatRoomId} />
            </div>
            
            <form onSubmit={handleSendMessage} className="chat-input-form" role="form" aria-label="Send message form">
                <div className="input-group">
                    <input 
                        type="text" 
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="message-input"
                        autoFocus
                        aria-label="Type your message"
                        maxLength={1000} // Giới hạn độ dài để tránh spam
                    />
                    <button 
                        type="submit" 
                        className="send-button"
                        disabled={!messageContent.trim()}
                        aria-label="Send message"
                    >
                        Send
                    </button>
                </div>
                <small className="input-hint">Press Enter to send, Shift+Enter for new line.</small>
            </form>
        </div>
    );
};

export default ChatWindow;