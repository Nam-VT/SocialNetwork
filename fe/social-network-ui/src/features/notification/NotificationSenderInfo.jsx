import { useGetUserByIdQuery } from '../user/userApiSlice';

const NotificationSenderInfo = ({ userId }) => {
    const { data: user, isLoading, isError } = useGetUserByIdQuery(userId);

    if (isLoading) {
        return <div className="avatar-skeleton" aria-label="Loading user avatar" />;
    }

    if (isError || !user) {
        return (
            <div className="avatar-fallback" aria-label="User  avatar not available">
                <img src="/default-avatar.png" alt="Default avatar" />
            </div>
        );
    }

    return (
        <div className="notification-sender-info">
            <img
                src={user.avatarUrl || '/default-avatar.png'}
                alt={user.displayName}
                className="avatar-image"
            />
        </div>
    );
};

export default NotificationSenderInfo;
