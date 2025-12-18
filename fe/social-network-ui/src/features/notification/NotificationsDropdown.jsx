import { useState, useRef } from 'react';
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
    const dropdownRef = useRef(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));
    
    const [page, setPage] = useState(0);

    const { 
        data: notificationsData, 
        isLoading, 
        isFetching,
        isSuccess, 
        isError 
    } = useGetMyNotificationsQuery({ page });

    const { data: unreadData } = useGetUnreadNotificationsCountQuery();
    const [markAllAsRead, { isLoading: isMarking }] = useMarkAllNotificationsAsReadMutation();
    
    const handleLoadMore = () => {
        if (notificationsData && !notificationsData.last && !isFetching) {
            setPage(p => p + 1);
        }
    };

    const notifications = notificationsData?.content || [];
    const unreadCount = unreadData?.count || 0;
    
    const hasUnread = unreadCount > 0;

    return (
        <div className="notifications-dropdown" ref={dropdownRef}>
            <button
                className="notifications-button"
                onClick={() => setIsOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={`Toggle notifications dropdown${hasUnread ? ` (${unreadCount} unread)` : ''}`}
                type="button"
            >
                {/* Icon Chuông */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                
                {hasUnread && (
                    <span className="notifications-badge" aria-label={`${unreadCount} unread notifications`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notifications-menu" role="menu" aria-label="Notifications list">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {/* 3. Thêm nút Mark All Read */}
                        <button 
                            className="mark-read-btn"
                            onClick={() => markAllAsRead()}
                            disabled={isMarking || !hasUnread}
                        >
                            Mark all read
                        </button>
                    </div>

                    <div className="notifications-body">
                        {isLoading && page === 0 && <p className="notifications-loading">Loading notifications...</p>}
                        
                        {isError && <p className="notifications-error">Failed to load notifications.</p>}
                        
                        {isSuccess && notifications.length === 0 && (
                            <p className="notifications-empty">No new notifications.</p>
                        )}
                        
                        {notifications.length > 0 && (
                            <ul className="notifications-list">
                                {notifications.map(n => (
                                    <li key={n.id} role="menuitem">
                                        <NotificationItem 
                                            notification={n} 
                                            onCloseDropdown={() => setIsOpen(false)} 
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* 4. Sửa logic nút Load More cho đúng với infinite scroll */}
                        {notificationsData && !notificationsData.last && (
                            <button 
                                className="load-more-btn" 
                                onClick={handleLoadMore}
                                disabled={isFetching}
                            >
                                {isFetching ? 'Loading...' : 'Load more'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;