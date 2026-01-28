import { Link } from 'react-router-dom';
import '../../styles/UserSearchResultItem.css'; // Import CSS từ src/styles/

const UserSearchResultItem = ({ user }) => {
    const { id, displayName, avatarUrl } = user;
    const defaultAvatar = 'https://via.placeholder.com/64/6b7280/ffffff?text=U';

    const handleAvatarError = (e) => {
        e.target.src = defaultAvatar;
        e.target.alt = `${displayName || 'User '} avatar (default)`;
    };

    return (
        <Link
            to={`/profile/${id}`}
            className="user-search-item"
            aria-label={`View profile of ${displayName || 'user'}`}
        >
            <div className="item-avatar">
                <img
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${displayName?.charAt(0) || 'U'}&size=64&background=random&color=fff`}
                    alt={`${displayName || 'User '} avatar`}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${displayName?.charAt(0) || 'U'}&size=64&background=random&color=fff`;
                    }}
                    width={64}
                    height={64}
                />
            </div>
            <div className="item-details">
                <h3 className="user-name">{displayName || 'Unknown User'}</h3>
                {/* Placeholder cho bio nếu thêm sau (comment như gốc) */}
                {/* <p className="user-bio">{user.bio || 'No bio available'}</p> */}
            </div>
        </Link>
    );
};

export default UserSearchResultItem;