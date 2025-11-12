import { useGetUserByIdQuery } from '../user/userApiSlice';
import { Link } from 'react-router-dom';
import '../../styles/CommentAuthorInfo.css';

const CommentAuthorInfo = ({ userId }) => {
    const { data: user, isLoading } = useGetUserByIdQuery(userId, { skip: !userId });

    if (isLoading) return <span className="comment-author-loading">Loading...</span>;
    if (!user) return <span className="comment-author-unknown">Unknown User</span>;

    const initial = user.displayName?.charAt(0).toUpperCase() || 'U';

    return (
        <div className="comment-author-info">
            <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${initial}&size=32&background=random`}
                alt={`${user.displayName}'s avatar`}
                className="comment-author-avatar"
                width={32}
                height={32}
                loading="lazy"
            />
            <Link to={`/profile/${user.id}`} className="comment-author-link">
                <strong>{user.displayName}</strong>
            </Link>
        </div>
    );
};

export default CommentAuthorInfo;