import { useNavigate } from 'react-router-dom';
import { useMarkAsReadMutation } from './notificationApiSlice';
import NotificationSenderInfo from './NotificationSenderInfo';
import '../../styles/NotificationItem.css';

const NotificationItem = ({ notification, onCloseDropdown }) => {
    const navigate = useNavigate();
    const [markAsRead] = useMarkAsReadMutation();

    const handleClick = async () => {
        // 1. Đánh dấu đã đọc nếu chưa đọc
        if (!notification.isRead) {
            try {
                // Đảm bảo truyền notification.id (Backend nhận UUID)
                await markAsRead(notification.id).unwrap();
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
        }
        
        // 2. Đóng dropdown trước khi chuyển trang (nếu có prop này từ component cha)
        if (onCloseDropdown) onCloseDropdown();

        // 3. Chuyển hướng theo URL trả về từ Backend
        if (notification.redirectUrl) {
            navigate(notification.redirectUrl);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            aria-label={`Notification: ${notification.content}`}
        >
            {/* Component lấy info người gửi từ user-service */}
            <div className="sender-avatar-container">
                <NotificationSenderInfo userId={notification.senderId} />
            </div>

            <div className="notification-body">
                <p className="notification-text">{notification.content}</p>
                <small className="notification-time">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {" · "}
                    {new Date(notification.createdAt).toLocaleDateString()}
                </small>
            </div>
            
            {!notification.isRead && <div className="unread-indicator" />}
        </div>
    );
};

export default NotificationItem;