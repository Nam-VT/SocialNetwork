import { useGetUserByIdQuery } from '../user/userApiSlice';
import '../../styles/NotificationSenderInfo.css';

const NotificationSenderInfo = ({ userId }) => {
    const { data: user, isLoading, isError } = useGetUserByIdQuery(userId);

    if (isLoading) {
        return <div className="avatar-skeleton" aria-label="Loading user avatar" />;
    }

    if (isError || !user) {
        return (
            <div className="avatar-fallback" aria-label="User  avatar not available">
                <img
                    src={`https://ui-avatars.com/api/?name=U&size=40&background=random&color=fff`}
                    alt="Default avatar"
                    className="notification-avatar-img"
                />
            </div>
        );
    }

    return (
        <div className="notification-sender-info">
            <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.displayName?.charAt(0) || 'U'}&size=40&background=random&color=fff`}
                alt={user.displayName}
                className="notification-avatar-img" // Renamed class
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${user.displayName?.charAt(0) || 'U'}&size=40&background=random&color=fff`;
                }}
            />
        </div>
    );
};

export default NotificationSenderInfo;
