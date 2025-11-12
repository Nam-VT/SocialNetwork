import { useState, useEffect } from 'react'; // <-- Đảm bảo import useEffect
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    useDeletePostMutation, 
    useTogglePostLikeMutation, 
    useHasUserLikedPostQuery,
    useUpdatePostMutation
} from './postApiSlice';
import { selectCurrentUser  } from '../auth/authSlice';
import PostAuthorInfo from './PostAuthorInfo';
import CommentSection from '../comment/CommentSection';
import { formatDate } from '../../utils/formatDate';
import { useClickOutside } from '../../hooks/useClickOutside';
import '../../styles/PostItem.css';

const PostItem = ({ post, isDetailView = false }) => {
    const { id, content, userId, mediaUrls = [], mediaIds = [], createdAt, likeCount = 0, commentCount = 0, isPrivate = false } = post;
    const currentUser  = useSelector(selectCurrentUser );
    const isOwner = currentUser ?.id === userId;

    const navigate = useNavigate();

    // State cho menu options
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const optionsRef = useRef(null);
    useClickOutside(optionsRef, () => setIsOptionsVisible(false));

    // --- State chỉnh sửa ---
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    // Đồng bộ editedContent khi post.content thay đổi
    useEffect(() => {
        setEditedContent(content);
    }, [content]);

    // Các hooks mutation
    const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
    const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
    const [togglePostLike, { isLoading: isLiking }] = useTogglePostLikeMutation();
    const { data: isLiked, isLoading: isLoadingLikeStatus } = useHasUserLikedPostQuery(id, { skip: !currentUser });

    const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);

    // Các handler khác giữ nguyên
    const handleLike = async () => {
        try {
            await togglePostLike(id).unwrap();
        } catch (err) {
            console.error('Failed to toggle like:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(id).unwrap();
            } catch (err) {
                console.error('Failed to delete the post:', err);
            }
        }
    };

    const handleToggleComments = () => {
        setIsCommentSectionVisible(prev => !prev);
    };

    const formattedDate = formatDate(createdAt);

    const handleNavigateToDetail = () => {
        if (!isDetailView) {
            navigate(`/post/${id}`);
        }
    };

    // --- Các hàm chỉnh sửa ---
    const handleEditToggle = () => {
        if (isEditing) {
            // Nếu đang chỉnh sửa, bấm Cancel sẽ reset nội dung
            setEditedContent(content);
        }
        setIsEditing(!isEditing);
    };

    const handleUpdatePost = async () => {
        if (editedContent.trim() === '') return;
        try {
            await updatePost({ 
                id, 
                content: editedContent.trim(), 
                isPrivate, 
                mediaIds // <-- Gửi lại mediaIds hiện có để không bị mất
            }).unwrap();
            setIsEditing(false);
            setIsOptionsVisible(false);
        } catch (err) {
            console.error('Failed to update post:', err);
        }
    };

    return (
        <article className="post-item">
            <header className="post-header">
                <PostAuthorInfo userId={userId} />
                
                <div className="post-meta">
                    <time className="post-time" dateTime={createdAt}>{formattedDate}</time>
                    {isPrivate && <span className="private-badge" title="This post is private">🔒 Private</span>}
                </div>

                {isOwner && (
                    <div className="owner-actions-container" ref={optionsRef}>
                        <button 
                            className="options-button" 
                            onClick={() => setIsOptionsVisible(prev => !prev)}
                            aria-label="More options"
                            title="More"
                            disabled={isDeleting || isUpdating}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                        {isOptionsVisible && (
                            <div className="options-menu">
                                <button onClick={() => { setIsEditing(true); setIsOptionsVisible(false); }}>Edit</button>
                                <button onClick={handleDelete}>Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <div
                onClick={handleNavigateToDetail}
                className={`post-content-clickable ${isDetailView ? 'no-click' : ''}`}
                role={isDetailView ? undefined : 'button'}
                tabIndex={isDetailView ? undefined : 0}
                onKeyDown={e => {
                    if (!isDetailView && (e.key === 'Enter' || e.key === ' ')) {
                        handleNavigateToDetail();
                    }
                }}
                aria-label={isDetailView ? undefined : 'View post details'}
            >
                {isEditing ? (
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        style={{ width: '100%', minHeight: '100px' }}
                        autoFocus
                        aria-label="Edit post content"
                        disabled={isUpdating}
                    />
                ) : (
                    <>
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
                    </>
                )}
            </div>

            <footer className="post-footer">
                {isEditing ? (
                    <div className="edit-actions">
                        <button 
                            onClick={handleUpdatePost} 
                            disabled={isUpdating || editedContent.trim() === ''}
                            className="action-button save-button"
                            aria-label="Save post changes"
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : (
                    <>
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
                                {/* icon và spinner giữ nguyên */}
                            </button>

                            {!isDetailView && (
                                <button
                                    onClick={handleToggleComments}
                                    className="action-button comment-button"
                                    title="Toggle comments"
                                    aria-label="Toggle comments section"
                                    aria-expanded={isCommentSectionVisible}
                                    disabled={isDeleting}
                                >
                                    {/* icon comment */}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </footer>

            {!isDetailView && isCommentSectionVisible && (
                <div className="comment-section-container">
                    <CommentSection postId={id} />
                </div>
            )}
        </article>
    );
};

export default PostItem;
