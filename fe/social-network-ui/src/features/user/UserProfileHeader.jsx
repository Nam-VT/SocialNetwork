import { useGetUserByIdQuery } from './userApiSlice';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCurrentUser  } from '../auth/authSlice';
import { 
    useGetUserByIdQuery,
    useGetFollowStatusQuery, 
    useFollowUserMutation, 
    useUnfollowUserMutation ,
    useGetFriendshipStatusQuery,
    useSendFriendRequestMutation,
    useAcceptFriendRequestMutation,
    useDeclineOrCancelRequestMutation,
    useUnfriendMutation
} from '../follow/followApiSlice';
import { useClickOutside } from '../../hooks/useClickOutside';
import '../../styles/UserProfileHeader.css';

const UserProfileHeader = ({ userId }) => {
    const { data: user, isLoading: isLoadingUser } = useGetUserByIdQuery(userId, { skip: !userId });
    const currentUser = useSelector(selectCurrentUser);
    const isOwnProfile = useMemo(() => currentUser?.id === userId, [currentUser?.id, userId]);
    
    // --- Logic cho Follow ---
    const { data: followStatus, isLoading: isLoadingFollowStatus } = useGetFollowStatusQuery(userId, { 
        skip: isOwnProfile || !currentUser 
    });
    const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
    const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

    // --- Logic cho Bạn bè ---
    const [isFriendMenuVisible, setIsFriendMenuVisible] = useState(false);
    const friendMenuRef = useRef(null);
    useClickOutside(friendMenuRef, () => setIsFriendMenuVisible(false));
    
    const { data: friendshipStatus, isLoading: isLoadingFriendStatus } = useGetFriendshipStatusQuery(userId, { 
        skip: isOwnProfile || !currentUser 
    });
    const [sendFriendRequest, { isLoading: isSendingRequest }] = useSendFriendRequestMutation();
    const [unfriend, { isLoading: isUnfriending }] = useUnfriendMutation();
    const [cancelRequest, { isLoading: isCancelling }] = useDeclineOrCancelRequestMutation();

    const isLoadingAction = isFollowing || isUnfollowing || isSendingRequest || isUnfriending || isCancelling;

   const handleFollowToggle = async () => {
        try {
            if (followStatus?.isFollowing) {
                await unfollowUser(userId).unwrap();
            } else {
                await followUser(userId).unwrap();
            }
        } catch (err) {
            console.error('Failed to toggle follow status:', err);
        }
    };
    
    // Hàm xử lý lỗi avatar (định nghĩa trước khi sử dụng)
    const handleAvatarError = (e) => {
        const initial = (displayName?.charAt(0).toUpperCase() || 'U');
        // Fallback 1: ui-avatars (thay vì via.placeholder)
        e.target.src = `https://ui-avatars.com/api/?name=${initial}&size=128&background=6B7280&color=fff`;
        // Fallback 2: Base64 nếu vẫn lỗi (dừng loop)
        e.target.onerror = () => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjNkI3MjgwIi8+CjxjaXJjbGUgY3g9IjY0IiBjeT0iNTAiIHI9IjMwIiBmaWxsPSIjRkZGIi8+Cjx0ZXh0IHg9IjY0IiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+' + encodeURIComponent(initial) + '</dGV4dD4KPC9zdmc+';
            e.target.onerror = null; // Dừng lặp
        };
    };

    // Hàm xử lý lỗi cover
    const handleCoverError = (e) => {
        e.target.style.display = 'none';
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

    if (isLoadingUser) { return <div>Loading profile...</div>; }
    if (!user) { return <div>User not found.</div>; }

    const { displayName, bio, avatarUrl, coverUrl } = user;

    return (
        <div className="profile-header">
            {/* Ảnh bìa */}
            <div className="cover-section">
                {coverUrl ? <img src={coverUrl} alt="Cover" className="cover-img" onError={handleCoverError} /> : <div className="cover-placeholder"></div>}
            </div>

            {/* Cấu trúc lại phần thông tin chính */}
            <div className="profile-details">
                {/* Avatar */}
                <div className="avatar-section">
                    <img src={avatarUrl || `https://ui-avatars.com/api/?name=${displayName?.charAt(0)}&size=128`} alt="Avatar" className="avatar-img" onError={handleAvatarError} />
                </div>

                {/* Tên và các nút hành động */}
                <div className="info-and-actions">
                    <div className="name-and-bio">
                        <h1 className="profile-name">{displayName || 'Unknown User'}</h1>
                        {bio && <p className="profile-bio">{bio}</p>}
                        {!isOwnProfile && followStatus?.isFollowedBy && (
                            <div className="follows-you-badge">Follows you</div>
                        )}
                    </div>
                    
                    <div className="profile-actions">
                        {isOwnProfile ? (
                            <button className="btn-profile edit-profile">Edit Profile</button>
                        ) : (
                            <>
                                <div className="friendship-button-container" ref={friendMenuRef}>
                                    {(() => {
                                        // Hiển thị trạng thái loading khi đang fetch
                                        if (isLoadingFriendStatus) {
                                            return <button className="btn-profile loading" disabled>...</button>;
                                        }

                                        // Nếu đã là bạn bè -> hiển thị nút "Friends" và menu unfriend
                                        if (friendshipStatus?.isFriends) {
                                            return (
                                                <button 
                                                    onClick={() => setIsFriendMenuVisible(prev => !prev)} 
                                                    className="btn-profile friends"
                                                >
                                                    ✓ Friends
                                                </button>
                                            );
                                        }

                                        // Nếu bạn đã gửi yêu cầu -> hiển thị nút "Request Sent"
                                        if (friendshipStatus?.isRequestSentByMe) {
                                            // Giả sử có `requestId` để có thể hủy yêu cầu
                                            return (
                                                <button 
                                                    onClick={() => cancelRequest(friendshipStatus.requestId)} 
                                                    disabled={isLoadingAction} 
                                                    className="btn-profile pending"
                                                >
                                                    Request Sent
                                                </button>
                                            );
                                        }

                                        // Nếu bạn nhận được yêu cầu -> hiển thị nút dẫn đến trang phản hồi
                                        if (friendshipStatus?.isRequestReceivedByMe) {
                                            return (
                                                <Link to="/friend-requests" className="btn-profile respond">
                                                    Respond to Request
                                                </Link>
                                            );
                                        }

                                        // Mặc định -> hiển thị nút "Add Friend"
                                        return (
                                            <button 
                                                onClick={() => sendFriendRequest(userId)} 
                                                disabled={isLoadingAction} 
                                                className="btn-profile add-friend"
                                            >
                                                Add Friend
                                            </button>
                                        );
                                    })()}
                                    
                                    {/* Menu Unfriend (chỉ hiện khi click vào nút "Friends") */}
                                    {isFriendMenuVisible && friendshipStatus?.isFriends && (
                                        <div className="options-menu-profile">
                                            <button onClick={() => { unfriend(userId); setIsFriendMenuVisible(false); }}>
                                                Unfriend
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Nút Follow */}
                                <button onClick={handleFollowToggle} disabled={isLoadingAction || isLoadingFollowStatus} className={`btn-profile follow-button ${followStatus?.isFollowing ? 'following' : ''}`}>
                                    {followStatus?.isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileHeader;
