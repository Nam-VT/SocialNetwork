import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTogglePostLikeMutation, useDeletePostMutation } from './postApiSlice';
import { selectCurrentUser } from '../auth/authSlice';
import PostAuthorInfo from './PostAuthorInfo';
import CommentSection from '../comment/CommentSection';
import { formatDate } from '../../utils/formatDate';
import { useClickOutside } from '../../hooks/useClickOutside';
import '../../styles/PostItem.css';

const PostItem = ({ post, isDetailView = false }) => {
    const {
        id,
        content,
        userId,
        mediaUrls = [],
        createdAt,
        likeCount = 0,
        commentCount = 0,
        isLiked = false
    } = post;

    const currentUser = useSelector(selectCurrentUser);
    const isOwner = currentUser?.id === userId;
    const navigate = useNavigate();

    const [toggleLike, { isLoading: isLiking }] = useTogglePostLikeMutation();
    const [deletePost] = useDeletePostMutation();

    const [isCommentVisible, setIsCommentVisible] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useClickOutside(menuRef, () => setIsMenuOpen(false));

    const handleLike = async () => {
        if (isLiking) return;
        try {
            // Pass object with id and userId (of the post author) to helper
            await toggleLike({ id, userId }).unwrap();
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
            try {
                await deletePost(id).unwrap();
                if (isDetailView) navigate('/');
            } catch (err) {
                console.error('Delete error:', err);
            }
        }
    };

    const renderMedia = () => {
        if (!mediaUrls || mediaUrls.length === 0) return null;

        const displayMedia = mediaUrls.slice(0, 4);
        const remaining = mediaUrls.length - 4;
        const gridClass = `media-grid-${Math.min(mediaUrls.length, 4)}`;

        return (
            <div className={`media-gallery ${gridClass}`}>
                {displayMedia.map((url, index) => (
                    <div key={index} className="media-item" onClick={() => navigate(`/posts/${id}`)}>
                        <img src={url} alt="Post media" loading="lazy" />
                        {index === 3 && remaining > 0 && (
                            <div className="media-overlay">+{remaining}</div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <article className="post-item">
            <div className="post-header">
                <PostAuthorInfo userId={userId} createdAt={formatDate(createdAt)} />
                {isOwner && (
                    <div className="post-menu" ref={menuRef}>
                        <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>•••</button>
                        {isMenuOpen && (
                            <div className="menu-dropdown">
                                <button onClick={() => navigate(`/posts/${id}/edit`)}>Chỉnh sửa</button>
                                <button onClick={handleDelete} className="delete-btn">Xóa</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="post-content">{content}</div>

            {renderMedia()}

            <div className="post-stats">
                <span>{likeCount > 0 ? `❤️ ${likeCount}` : 'Chưa có lượt thích'}</span>
            </div>

            <div className="post-actions">
                <button
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                    disabled={isLiking}
                >
                    <span className="icon">{isLiked ? '❤️' : '🤍'}</span> Thích
                </button>
                <button className="action-btn" onClick={() => setIsCommentVisible(!isCommentVisible)}>
                    <span className="icon">💬</span> Bình luận
                </button>
            </div>

            {isCommentVisible && <CommentSection postId={id} postOwnerId={userId} />}
        </article>
    );
};

export default PostItem;