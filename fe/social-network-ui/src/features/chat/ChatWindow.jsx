import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGetMessageHistoryQuery, useUploadMediaMutation } from './chatApiSlice';
import { websocketService } from '../../service/websocketService';
import MessageList from './MessageList';
import ChatHeader from './ChatHeader';
import '../../styles/ChatWindow.css';

const ChatWindow = () => {
    const { chatRoomId } = useParams();
    const [message, setMessage] = useState('');
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(true);

    const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

    // Fetch initial message history
    const { data: messageHistory, isLoading } = useGetMessageHistoryQuery(
        { chatRoomId, page: 0, size: 50 },
        { skip: !chatRoomId }
    );

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // Auto-scroll when messageHistory changes
    useEffect(() => {
        if (shouldScroll) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [messageHistory, shouldScroll]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !chatRoomId) return;

        websocketService.sendMessage(chatRoomId, {
            content: message.trim(),
            type: 'TEXT',
            mediaId: null
        });
        setMessage('');

        // Force scroll after sending
        setShouldScroll(true);
        setTimeout(() => scrollToBottom(), 200);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !chatRoomId) return;

        // Validation: Max size 20MB
        if (file.size > 20 * 1024 * 1024) {
            alert('File is too large. Maximum size is 20MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Determine message type
        let type = 'FILE';
        if (file.type.startsWith('image/')) type = 'IMAGE';
        else if (file.type.startsWith('video/')) type = 'VIDEO';

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await uploadMedia(formData).unwrap();

            // Send message with mediaId
            websocketService.sendMessage(chatRoomId, {
                content: '', // No caption for now
                type: type,
                mediaId: response.id
            });

            setShouldScroll(true);
            setTimeout(() => scrollToBottom(), 200);
        } catch (error) {
            console.error('Failed to upload media:', error);
            alert('Failed to send file.');
        } finally {
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
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

    if (isLoading) {
        return (
            <div className="chat-window loading">
                <div className="loading-spinner">Loading messages...</div>
            </div>
        );
    }

    const messages = messageHistory?.content || [];
    // Reverse messages to show old messages at top, new messages at bottom
    // Backend returns DESC order (newest first), we need ASC order (oldest first)
    const sortedMessages = [...messages].reverse();

    return (
        <div className="chat-window">
            {/* Header - Fixed at top */}
            <ChatHeader chatRoomId={chatRoomId} />

            {/* Messages area - Scrollable */}
            <div className="chat-messages-container" ref={messagesContainerRef}>
                <MessageList
                    chatRoomId={chatRoomId}
                    messages={sortedMessages}
                    onNewMessage={() => {
                        // Scroll when new message arrives via WebSocket
                        setTimeout(() => scrollToBottom(), 100);
                    }}
                />
            </div>

            {/* Input form - Fixed at bottom */}
            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                />

                <button
                    type="button"
                    className="attach-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Attach image or video"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </button>

                <div className="input-group">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={isUploading ? "Uploading..." : "Type a message..."}
                        className="message-input"
                        autoFocus
                        maxLength={1000}
                        disabled={isUploading}
                    />
                    <button
                        type="submit"
                        className="send-button"
                        disabled={!message.trim() || isUploading}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;