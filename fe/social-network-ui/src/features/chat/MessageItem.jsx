import { useGetUserByIdQuery } from '../user/userApiSlice';
import '../../styles/MessageItem.css'; // Import CSS từ src/styles/

const MessageItem = ({ message, isOwnMessage }) => {
    const { senderId, content, createdAt } = message;
    
    // Skip query nếu là tin nhắn của chính mình (không cần fetch sender)
    const { data: sender, isLoading: isSenderLoading, isError: isSenderError } = useGetUserByIdQuery(senderId, {
        skip: isOwnMessage || !senderId
    });

    const displayName = sender?.displayName || 'Unknown User';
    const avatarUrl = sender?.avatarUrl || 'https://via.placeholder.com/32x32/6b7280/ffffff?text=U';

    if (isOwnMessage) {
        return (
            <div className="message-item own" role="log" aria-live="polite">
                <div className="message-content own-content">
                    <p className="message-text">{content}</p>
                    {createdAt && (
                        <small className="message-time">{formatTime(createdAt)}</small>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="message-item other" role="log" aria-live="polite">
            <div className="message-avatar">
                {isSenderLoading ? (
                    <div className="skeleton-avatar"></div>
                ) : (
                    <img 
                        src={avatarUrl} 
                        alt={`${displayName}'s avatar`} 
                        className="avatar-img"
                        width={32}
                        height={32}
                    />
                )}
            </div>
            <div className="message-content other-content">
                <div className="sender-info">
                    {isSenderLoading ? (
                        <div className="skeleton-name"></div>
                    ) : isSenderError ? (
                        <strong className="sender-name error">Unknown User</strong>
                    ) : (
                        <strong className="sender-name">{displayName}</strong>
                    )}
                    {createdAt && (
                        <small className="message-time">{formatTime(createdAt)}</small>
                    )}
                </div>
                <p className="message-text">{content}</p>
            </div>
        </div>
    );
};

// Helper function để format thời gian (có thể di chuyển ra utils nếu dùng chung)
const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

export default MessageItem;