import { useState, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import {
    useGetUserByIdQuery,
    useGetFriendshipStatusQuery,
    useSendFriendRequestMutation,
    useUnfriendMutation,
    useDeclineOrCancelRequestMutation,
    useAcceptFriendRequestMutation
} from './userApiSlice';

import {
    useGetFollowStatusQuery,
    useFollowUserMutation,
    useUnfollowUserMutation
} from '../follow/followApiSlice';
import { useClickOutside } from '../../hooks/useClickOutside';
import '../../styles/UserProfileHeader.css';

const UserProfileHeader = ({ userId, onEditClick }) => {
    // 1. Fetch dữ liệu User
    const { data: user, isLoading: isLoadingUser, isError } = useGetUserByIdQuery(userId, { skip: !userId });

    const currentUser = useSelector(selectCurrentUser);
    const isOwnProfile = useMemo(() => currentUser?.id === userId, [currentUser?.id, userId]);

    // 2. Trạng thái quan hệ (Chỉ gọi khi không phải profile cá nhân)
    const shouldSkipStatus = isOwnProfile || !currentUser;

    console.log('🔍 UserProfileHeader Debug:', {
        userId,
        currentUserId: currentUser?.id,
        isOwnProfile,
        shouldSkipStatus,
        currentUser
    });

    const { data: followStatus, isLoading: isLoadingFollowStatus } = useGetFollowStatusQuery(userId, {
        skip: shouldSkipStatus
    });

    const { data: friendshipStatus, isLoading: isLoadingFriendStatus } = useGetFriendshipStatusQuery(userId, {
        skip: shouldSkipStatus
    });

    console.log('📊 Status Data:', {
        followStatus,
        friendshipStatus,
        isFollowing: followStatus?.isFollowing,
        isFriends: friendshipStatus?.isFriends,
        isRequestSentByMe: friendshipStatus?.isRequestSentByMe,
        isRequestReceivedByMe: friendshipStatus?.isRequestReceivedByMe
    });

    console.log('🔎 Raw Objects:', {
        followStatusRaw: JSON.stringify(followStatus),
        friendshipStatusRaw: JSON.stringify(friendshipStatus)
    });

    // 3. Các hàm hành động
    const [followUser] = useFollowUserMutation();
    const [unfollowUser] = useUnfollowUserMutation();
    const [sendFriendRequest, { isLoading: isSendingRequest }] = useSendFriendRequestMutation();
    const [unfriend, { isLoading: isUnfriending }] = useUnfriendMutation();
    const [cancelRequest, { isLoading: isCancelling }] = useDeclineOrCancelRequestMutation();
    const [acceptRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();

    const [isFriendMenuVisible, setIsFriendMenuVisible] = useState(false);
    const friendMenuRef = useRef(null);
    useClickOutside(friendMenuRef, () => setIsFriendMenuVisible(false));

    const isLoadingAction = isSendingRequest || isUnfriending || isCancelling || isAccepting;

    const handleFollowToggle = async () => {
        try {
            if (followStatus?.isFollowing) {
                await unfollowUser(userId).unwrap();
            } else {
                await followUser(userId).unwrap();
            }
        } catch (err) {
            console.error('Lỗi khi thực hiện follow/unfollow:', err);
        }
    };

    if (isLoadingUser) return <div className="profile-loading">Loading...</div>;
    if (isError || !user) return <div className="profile-error">User not found.</div>;

    const { displayName, bio, avatarUrl, coverUrl } = user;
    const initial = displayName?.charAt(0).toUpperCase() || 'U';

    return (
        <div className="profile-header">
            <div className="cover-section">
                {coverUrl ? <img src={coverUrl} alt="Cover" className="cover-img" /> : <div className="cover-placeholder" />}
            </div>

            <div className="profile-details">
                <div className="avatar-section">
                    <img
                        src={avatarUrl || `https://ui-avatars.com/api/?name=${initial}&size=128`}
                        alt={displayName}
                        className="avatar-img"
                    />
                </div>

                <div className="info-and-actions">
                    <div className="name-and-bio">
                        <h1 className="profile-name">{displayName}</h1>
                        {bio && <p className="profile-bio">{bio}</p>}

                        <div className="profile-about">
                            {user.location && (
                                <div className="about-item">
                                    <span className="about-icon">📍</span>
                                    <span>{user.location}</span>
                                </div>
                            )}
                            {user.birthday && (
                                <div className="about-item">
                                    <span className="about-icon">🎂</span>
                                    <span>{new Date(user.birthday).toLocaleDateString()}</span>
                                </div>
                            )}
                            {user.gender && (
                                <div className="about-item">
                                    <span className="about-icon">👤</span>
                                    <span>{user.gender}</span>
                                </div>
                            )}
                            {user.publicEmail && (
                                <div className="about-item">
                                    <span className="about-icon">✉️</span>
                                    <span>{user.publicEmail}</span>
                                </div>
                            )}
                            {user.phoneNumber && (
                                <div className="about-item">
                                    <span className="about-icon">📞</span>
                                    <span>{user.phoneNumber}</span>
                                </div>
                            )}
                            {user.interests && user.interests.length > 0 && (
                                <div className="about-interests">
                                    {user.interests.map((interest, index) => (
                                        <span key={index} className="interest-tag">{interest}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-actions">
                        {isOwnProfile ? (
                            <button
                                className="btn-profile edit-profile"
                                onClick={onEditClick} // Thêm dòng này
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <div className="friendship-button-container" ref={friendMenuRef}>
                                    {(() => {
                                        if (isLoadingFriendStatus) return <button className="btn-profile" disabled>...</button>;

                                        if (friendshipStatus?.isFriends) {
                                            return (
                                                <button onClick={() => setIsFriendMenuVisible(!isFriendMenuVisible)} className="btn-profile friends">
                                                    ✓ Friends
                                                </button>
                                            );
                                        }

                                        if (friendshipStatus?.isRequestSentByMe) {
                                            return (
                                                <button onClick={() => cancelRequest(friendshipStatus.requestId)} disabled={isLoadingAction} className="btn-profile pending">
                                                    Cancel Request
                                                </button>
                                            );
                                        }

                                        if (friendshipStatus?.isRequestReceivedByMe) {
                                            return (
                                                <button onClick={() => acceptRequest(friendshipStatus.requestId)} disabled={isLoadingAction} className="btn-profile respond">
                                                    Accept Request
                                                </button>
                                            );
                                        }

                                        return (
                                            <button onClick={() => sendFriendRequest(userId)} disabled={isLoadingAction} className="btn-profile add-friend">
                                                Add Friend
                                            </button>
                                        );
                                    })()}

                                    {isFriendMenuVisible && friendshipStatus?.isFriends && (
                                        <div className="options-menu-profile">
                                            <button onClick={() => unfriend(userId)}>Unfriend</button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleFollowToggle}
                                    className={`btn-profile follow-button ${followStatus?.isFollowing ? 'following' : ''}`}
                                >
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