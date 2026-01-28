import { useGetUserByIdQuery } from '../user/userApiSlice';
import '../../styles/MessageItem.css'; // Import CSS từ src/styles/

const MessageItem = ({ message, isOwnMessage }) => {
    const { senderId, content, createdAt, type, mediaUrl } = message;

    // Skip query nếu là tin nhắn của chính mình (không cần fetch sender)
    const { data: sender, isLoading: isSenderLoading, isError: isSenderError } = useGetUserByIdQuery(senderId, {
        skip: isOwnMessage || !senderId
    });

    const displayName = sender?.displayName || 'Unknown User';
    const avatarUrl = sender?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender?.displayName || 'U')}&background=6b7280&color=fff&size=32`;

    const renderContent = () => {
        if (type === 'IMAGE' && mediaUrl) {
            return (
                <div className="message-media">
                    <img
                        src={mediaUrl}
                        alt="Shared image"
                        loading="lazy"
                        className="media-image"
                        onClick={() => window.open(mediaUrl, '_blank')}
                    />
                </div>
            );
        } else if (type === 'VIDEO' && mediaUrl) {
            return (
                <div className="message-media">
                    <video controls className="media-video">
                        <source src={mediaUrl} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        } else {
            return <p className="message-text">{content}</p>;
        }
    };

    if (isOwnMessage) {
        return (
            <div className="message-item own" role="log" aria-live="polite">
                <div className="message-content own-content">
                    {renderContent()}
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
                        className="chat-avatar-img"
                        width={32}
                        height={32}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sender?.displayName || 'U')}&background=6b7280&color=fff&size=32`;
                        }}
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
                {renderContent()}
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