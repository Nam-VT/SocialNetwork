// src/features/post/PostItem.jsx

import { useState } from 'react';
import { useSelector } from 'react-redux';

import { 
    useDeletePostMutation, 
    useTogglePostLikeMutation, 
    useHasUserLikedPostQuery 
} from './postApiSlice';
import { selectCurrentUser  } from '../auth/authSlice';
import PostAuthorInfo from './PostAuthorInfo';
import CommentSection from '../comment/CommentSection';
import { formatDate } from '../../utils/dateUtils'; // Optional: Nếu chưa có, fallback inline dưới
import '../../styles/PostItem.css';

const PostItem = ({ post }) => {
    const { 
        id, 
        content, 
        userId, 
        mediaUrls = [],
        createdAt, 
        likeCount = 0,
        commentCount = 0,
        isPrivate = false
    } = post;

    const currentUser  = useSelector(selectCurrentUser );
    const isOwner = currentUser ?.id === userId;

    const { data: likedData, isLoading: isLoadingLikeStatus } = useHasUserLikedPostQuery(id, { skip: !currentUser  });
    const isLiked = likedData ?? false;

    const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
    const [togglePostLike, { isLoading: isLiking }] = useTogglePostLikeMutation();

    const handleLike = async () => {
        try {
            await togglePostLike(id).unwrap();
        } catch (err) {
            console.error('Failed to toggle like:', err);
            alert('Failed to like/unlike post. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(id).unwrap();
            } catch (err) {
                console.error('Failed to delete the post:', err);
                alert('Failed to delete post. Please try again.');
            }
        }
    };

    const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);
    const handleToggleComments = () => {
        setIsCommentSectionVisible(prevState => !prevState);
    };

    // Format date (fallback inline nếu formatDate undefined)
    const formattedDate = (typeof formatDate === 'function' ? formatDate(createdAt) : 
        new Date(createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    );

    return (
        <article className="post-item">
            <header className="post-header">
                <PostAuthorInfo userId={userId} />
                
                <div className="post-meta">
                    <time className="post-time" dateTime={createdAt}>{formattedDate}</time>
                    {isPrivate && <span className="private-badge" title="This post is private">🔒 Private</span>}
                </div>
                
                {isOwner && (
                    <button 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        className="action-button delete-button"
                        title="Delete post"
                        aria-label="Delete this post"
                    >
                        <span className="action-icon">
                            {isDeleting ? (
                                <div className="spinner-small"></div>
                            ) : (
                                <svg className="delete-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </span>
                        <span className="action-text">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                )}
            </header>

            <section className="post-content">
                {content && <p className="post-text">{content}</p>}

                {mediaUrls.length > 0 && (
                    <div className="media-gallery">
                        {mediaUrls.slice(0, 4).map((url, index) => (
                            <div key={index} className="media-item">
                                <img 
                                    src={url} 
                                    alt={`Post media ${index + 1}`} 
                                    className="media-img"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                        {mediaUrls.length > 4 && (
                            <div className="media-more">
                                +{mediaUrls.length - 4} more
                            </div>
                        )}
                    </div>
                )}
            </section>
            
            <footer className="post-footer">
                <div className="post-stats">
                    <span className="stat-item like-stat">{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                    <span className="stat-item comment-stat">{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
                </div>

                <div className="post-actions">
                    <button 
                        onClick={handleLike} 
                        disabled={isLoadingLikeStatus || isLiking}
                        className={`action-button like-button ${isLiked ? 'liked' : ''}`}
                        title={isLiked ? 'Unlike post' : 'Like post'}
                        aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
                    >
                        <span className="action-icon">
                            {isLoadingLikeStatus || isLiking ? (
                                <div className="spinner-small"></div>
                            ) : (
                                <svg className={`heart-icon ${isLiked ? 'filled' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9.352 4.242c.652-1.651 3.308-1.651 3.96 0l1.704 4.318a1 1 0 00.896.725h4.396a1 1 0 00.873-1.427l-3.52-4.237a1 1 0 00-1.497 0l-3.52 4.237a1 1 0 00-1.497 0l-3.52-4.237A1 1 0 00.4 9.713h4.396a1 1 0 00.896-.725l1.704-4.318z" />
                                </svg>
                            )}
                        </span>
                        <span className="action-text">Like</span>
                    </button>
                    <button 
                        onClick={handleToggleComments} 
                        className="action-button comment-button"
                        title="Toggle comments"
                        aria-label="Toggle comments section"
                        aria-expanded={isCommentSectionVisible}
                        disabled={isDeleting}
                    >
                        <span className="action-icon">
                            <svg className="comment-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                            </svg>
                        </span>
                        <span className="action-text">Comment</span>
                    </button>
                </div>
            </footer>
            
            {isCommentSectionVisible && (
                <div className="comment-section-container">
                    <CommentSection postId={id} />
                </div>
            )}
        </article>
    );
};

export default PostItem;