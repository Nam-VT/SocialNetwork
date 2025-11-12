import { useState, useEffect, useRef, useCallback } from 'react';
import { useGetNotificationsQuery } from './notificationApiSlice';
import NotificationItem from './NotificationItem';
import '../../styles/NotificationsDropdown.css'; // Sửa đường dẫn: giả sử CSS cùng thư mục

const NotificationsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const {
        data: notificationsData,
        isLoading,
        isSuccess,
        isError,
        error, // Thêm để xử lý lỗi
    } = useGetNotificationsQuery({ page: 0, size: 7 }); // Lấy 7 thông báo gần nhất

    useEffect(() => {
        // 1. Định nghĩa hàm `handleClickOutside` ở đây
        const handleClickOutside = (event) => {

            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        // 2. Thêm event listener
        document.addEventListener("mousedown", handleClickOutside);
        
        // 3. Dọn dẹp event listener khi component bị unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]); // Thêm dependency đúng

    const hasUnread = notificationsData?.content?.some(n => !n.isRead) ?? false;
    const unreadCount = notificationsData?.content?.filter(n => !n.isRead).length ?? 0; // Optional: đếm số unread

    // Xử lý lỗi (nếu có)
    if (isError) {
        console.error('Failed to fetch notifications:', error);
        // Có thể dispatch refetch hoặc hiển thị toast
    }

    return (
        <div className="notifications-dropdown" ref={dropdownRef}>
            <button
                className="notifications-button"
                onClick={() => setIsOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={`Toggle notifications dropdown${hasUnread ? ` (${unreadCount} unread)` : ''}`}
                type="button"
                disabled={isLoading} // Disable khi loading
            >
                🔔
                {hasUnread && (
                    <span className="notifications-badge" aria-label={`${unreadCount} unread notifications`}>
                        {unreadCount > 0 ? unreadCount : '●'}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notifications-menu" role="menu" aria-label="Notifications list">
                    {isLoading && <p className="notifications-loading">Loading notifications...</p>}
                    {isError && <p className="notifications-error">Failed to load notifications. Try again.</p>}
                    {isSuccess && notificationsData.content.length === 0 && (
                        <p className="notifications-empty">No new notifications.</p>
                    )}
                    {isSuccess && notificationsData.content.length > 0 && (
                        <ul className="notifications-list">
                            {notificationsData.content.map(n => (
                                <li key={n.id} role="menuitem">
                                    <NotificationItem notification={n} />
                                </li>
                            ))}
                            {notificationsData.totalElements > 7 && ( // Nếu có nhiều hơn 7, thêm link xem thêm
                                <li className="view-all-notifications">
                                    <button onClick={() => {/* Navigate to full notifications page */}}>
                                        View all notifications
                                    </button>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;