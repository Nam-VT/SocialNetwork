import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMessageHistoryQuery } from './chatApiSlice';
import { chatApiSlice } from './chatApiSlice';
import { websocketService } from '../../service/websocketService';
import { selectCurrentUser  } from '../auth/authSlice';
import MessageItem from './MessageItem';
import '../../styles/MessageList.css'; // Import CSS từ src/styles/

const MessageList = ({ chatRoomId }) => {
    const dispatch = useDispatch();
    const currentUser  = useSelector(selectCurrentUser );
    const messagesEndRef = useRef(null);

    const [page, setPage] = useState(0);

    const { data: messageData, isLoading, isError, isFetching } = useGetMessageHistoryQuery({ chatRoomId, page }, {
        skip: !chatRoomId
    });

    // Tự động cuộn xuống tin nhắn mới nhất khi data thay đổi (bao gồm WebSocket updates)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageData]);

    useEffect(() => {
        if (!chatRoomId) return;

        const onMessageReceived = (newMessage) => {
            dispatch(
                chatApiSlice.util.updateQueryData('getMessageHistory', { chatRoomId }, (draft) => {
                    draft.content.push(newMessage);
                })
            );
        };

        websocketService.subscribeToChatRoom(chatRoomId, onMessageReceived);

        return () => {
            websocketService.unsubscribeFromChatRoom(chatRoomId);
        };
    }, [chatRoomId, dispatch]);

    const handleLoadMore = () => {
        if (messageData && !messageData.first && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    if (!chatRoomId) {
        return <div className="message-list-empty">Select a conversation to start chatting.</div>;
    }

    if (isError) {
        return <div className="message-list-error">Error loading messages. Please try again.</div>;
    }

    if (isLoading && !messageData) {
        return (
            <div className="message-list loading">
                <div className="messages-loading">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="message-skeleton">
                            <div className="skeleton-avatar"></div>
                            <div className="skeleton-bubble"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const messages = messageData?.content || [];

    return (
        <div className="message-list" role="log" aria-live="polite">
            {/* Nút Load More */}
            {messageData && !messageData.first && (
                <div className="load-more-container">
                    <button onClick={handleLoadMore} disabled={isFetching}>
                        {isFetching ? 'Loading...' : 'Load older messages'}
                    </button>
                </div>
            )}

            {messages.length === 0 ? (
                <div className="messages-empty">No messages yet. Start the conversation!</div>
            ) : (
                messages.map(msg => (
                    <MessageItem 
                        key={msg.id} 
                        message={msg}
                        isOwnMessage={msg.senderId === currentUser.id}
                    />
                ))
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;