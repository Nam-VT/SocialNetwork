import { useGetUserByIdQuery } from './userApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { 
    useGetFollowStatusQuery, 
    useFollowUserMutation, 
    useUnfollowUserMutation 
} from '../follow/followApiSlice';
import '../../styles/UserProfileHeader.css';

const UserProfileHeader = ({ userId }) => {
    const { 
        data: user, 
        isLoading, 
        isError 
    } = useGetUserByIdQuery(userId, { skip: !userId });

    const currentUser = useSelector(selectCurrentUser);

    const isOwnProfile = currentUser?.id === userId;

    const { data: followStatus, isLoading: isLoadingStatus } = useGetFollowStatusQuery(
        userId, 
        { skip: isOwnProfile }
    );

    const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
    const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

    // Biến tổng hợp trạng thái loading cho nút follow/unfollow
    const isLoadingAction = isFollowing || isUnfollowing || isLoadingStatus;

    const handleFollowToggle = async () => {
        try {
            if (followStatus?.isFollowing) {
                await unfollowUser(userId).unwrap();
            } else {
                await followUser(userId).unwrap();
            }
        } catch (err) {
            console.error('Failed to toggle follow status:', err);
            // TODO: Thêm toast notification hoặc xử lý lỗi phù hợp
        }
    };

    if (isLoading) {
        return (
            <div className="profile-loading">
                <div className="spinner-medium"></div>
                <span className="loading-text">Loading profile...</span>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="profile-error">
                <div className="error-icon">
                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="error-text">Could not load user profile.</span>
            </div>
        );
    }

    const { displayName, bio, avatarUrl, coverUrl } = user;

    return (
        <div className="profile-header">
            {/* Ảnh bìa */}
            <div className="cover-section">
                {coverUrl ? (
                    <img 
                        src={coverUrl} 
                        alt={`${displayName}'s cover photo`} 
                        className="cover-img"
                        onError={(e) => { 
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="cover-placeholder" style={{ '--user-initial': `'${displayName.charAt(0).toUpperCase()}'` }}></div>
                )}
            </div>

            {/* Avatar và Tên */}
            <div className="profile-info">
                <div className="avatar-section">
                    <div className="avatar-wrapper">
                        <img 
                            src={avatarUrl || `https://via.placeholder.com/128x128/6B7280/FFFFFF?text=${displayName.charAt(0).toUpperCase()}`} 
                            alt={displayName || 'User avatar'} 
                            className="avatar-img"
                            onError={(e) => { 
                                e.target.src = `https://via.placeholder.com/128x128/6B7280/FFFFFF?text=U`;
                            }}
                        />
                    </div>
                </div>
                <div className="name-section">
                    <h1 className="profile-name">{displayName || 'Unknown User'}</h1>
                </div>
            </div>

            {/* Bio */}
            {bio && (
                <div className="bio-section">
                    <p className="profile-bio">{bio}</p>
                </div>
            )}

            {/* Nút Follow/Unfollow (không hiện với chính chủ) */}
            <div className="follow-button-wrapper">
                {!isOwnProfile && (
                    <button 
                        onClick={handleFollowToggle} 
                        disabled={isLoadingAction}
                        className={`follow-button ${followStatus?.isFollowing ? 'following' : 'not-following'}`}
                        aria-pressed={followStatus?.isFollowing}
                    >
                        {isLoadingAction 
                            ? '...' 
                            : (followStatus?.isFollowing ? 'Following' : 'Follow')}
                    </button>
                )}
            </div>

            {/* Thông báo "Follows you" nếu người này đang theo dõi bạn */}
            {!isOwnProfile && followStatus?.isFollowedBy && (
                <div className="follows-you-text">
                    <span>Follows you</span>
                </div>
            )}
        </div>
    );
};

export default UserProfileHeader;