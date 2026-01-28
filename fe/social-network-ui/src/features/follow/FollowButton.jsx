import { useFollowUserMutation, useUnfollowUserMutation, useGetFollowStatusQuery } from './followApiSlice';
import '../../styles/FollowButton.css';

const FollowButton = ({ targetUserId }) => {
    const { data: followStatus, isLoading: isLoadingStatus } = useGetFollowStatusQuery(targetUserId);
    const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
    const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

    const isFollowed = followStatus?.isFollowing || false;
    const isProcessing = isFollowing || isUnfollowing;

    const handleClick = async () => {
        try {
            if (isFollowed) {
                await unfollowUser(targetUserId).unwrap();
            } else {
                await followUser(targetUserId).unwrap();
            }
        } catch (error) {
            console.error('Failed to toggle follow status:', error);
        }
    };

    if (isLoadingStatus) {
        return (
            <button className="follow-button loading" disabled>
                Loading...
            </button>
        );
    }

    return (
        <button
            className={`follow-button ${isFollowed ? 'following' : 'not-following'}`}
            onClick={handleClick}
            disabled={isProcessing}
        >
            {isProcessing ? (
                <span className="spinner-small"></span>
            ) : isFollowed ? (
                'Following'
            ) : (
                'Follow'
            )}
        </button>
    );
};

export default FollowButton;
