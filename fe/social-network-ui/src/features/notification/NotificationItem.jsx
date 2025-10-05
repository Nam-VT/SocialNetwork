import { useNavigate } from 'react-router-dom';
import { useMarkAsReadMutation } from './notificationApiSlice';
import NotificationSenderInfo from './NotificationSenderInfo';
import '../../styles/NotificationItem.css';

const NotificationItem = ({ notification }) => {
    const navigate = useNavigate();
    const [markAsRead] = useMarkAsReadMutation();

    const handleClick = () => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        navigate(notification.redirectUrl);
    };

    return (
        <div
            onClick={handleClick}
            className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleClick();
                }
            }}
            aria-pressed={notification.isRead}
        >
            <NotificationSenderInfo userId={notification.senderId} />
            <div className="notification-content">
                <p className="notification-text">{notification.content}</p>
                <small className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                </small>
            </div>
        </div>
    );
};

export default NotificationItem;