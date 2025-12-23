import { useState, useRef, useEffect } from 'react';
import { 
    useGetMyNotificationsQuery, 
    useGetUnreadNotificationsCountQuery,
    useMarkAllNotificationsAsReadMutation 
} from './notificationApiSlice';
import NotificationItem from './NotificationItem';
import { useClickOutside } from '../../hooks/useClickOutside';
import '../../styles/NotificationsDropdown.css';

const NotificationsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(0);
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useClickOutside(dropdownRef, () => setIsOpen(false));

    // Lấy dữ liệu từ Backend
    const { 
        data: notificationsData, 
        isLoading, 
        isFetching, 
        isError 
    } = useGetMyNotificationsQuery({ page }, { skip: !isOpen }); // Chỉ fetch khi mở dropdown

    const { data: unreadData } = useGetUnreadNotificationsCountQuery();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

    const unreadCount = unreadData?.count || 0;
    const notifications = notificationsData?.content || [];
    const hasMore = notificationsData ? !notificationsData.last : false;

    // Reset trang về 0 khi đóng/mở lại nếu cần (tùy chọn)
    useEffect(() => {
        if (!isOpen) setPage(0);
    }, [isOpen]);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleMarkAll = async () => {
        try {
            await markAllAsRead().unwrap();
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    return (
        <div className="notifications-dropdown-container" ref={dropdownRef}>
            {/* Nút Chuông */}
            <button 
                className={`notifications-trigger ${isOpen ? 'active' : ''}`} 
                onClick={handleToggle}
                aria-label="Notifications"
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="unread-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Menu nội dung */}
            {isOpen && (
                <div className="notifications-menu shadow-lg">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={handleMarkAll}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notifications-list">
                        {isLoading && page === 0 ? (
                            <div className="loading-state">Loading notifications...</div>
                        ) : notifications.length > 0 ? (
                            <>
                                {notifications.map((notification) => (
                                    <NotificationItem 
                                        key={notification.id} 
                                        notification={notification} 
                                        onCloseDropdown={() => setIsOpen(false)}
                                    />
                                ))}
                                
                                {hasMore && (
                                    <button 
                                        className="load-more-btn" 
                                        onClick={() => setPage(prev => prev + 1)}
                                        disabled={isFetching}
                                    >
                                        {isFetching ? 'Loading more...' : 'See older notifications'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">No notifications yet.</div>
                        )}
                        
                        {isError && (
                            <div className="error-state">Could not load notifications.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;