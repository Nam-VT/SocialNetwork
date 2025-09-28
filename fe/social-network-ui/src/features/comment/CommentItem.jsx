import { useState } from 'react'; // Thêm useState nếu cần local state (e.g., cho confirm), nhưng giữ nguyên logic gốc
import { useDeleteCommentMutation, useToggleCommentLikeMutation } from './commentApiSlice';
import '../../styles/CommentItem.css'; // Import từ folder styles tập trung (điều chỉnh path nếu cần)
import { formatDate } from '../../utils/dateUtils'; // Giả định utils để format timestamp (tùy chọn, có thể implement đơn giản)

const CommentItem = ({ comment }) => {
    // Giả sử object comment có dạng: { id, content, author: { name, avatarUrl }, createdAt, likesCount, isLiked, isOwner }
    // Nếu không có các field này, bạn có thể set default values
    const { 
        id, 
        content, 
        author = {}, 
        createdAt = new Date().toISOString(), // Default nếu không có
        likesCount = 0,
        isLiked = false,
        isOwner = false // Giả định để show delete button
    } = comment;

    const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
    const [toggleLike, { isLoading: isLiking }] = useToggleCommentLikeMutation();

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteComment(id).unwrap();
            } catch (err) {
                console.error('Failed to delete comment:', err);
                // Có thể thêm toast error nếu cần
            }
        }
    };

    const handleLike = async () => {
        try {
            await toggleLike(id).unwrap();
            // Cập nhật local state nếu cần (e.g., setIsLiked(!isLiked)), nhưng RTK Query sẽ refetch
        } catch (err) {
            console.error('Failed to like comment:', err);
        }
    };

    const handleReply = () => {
        // Logic reply (e.g., focus vào CommentForm, mở modal), tạm thời console
        console.log('Reply to comment:', id);
    };

    return (
        <div className="comment-item">
            <div className="comment-avatar">
                <img 
                    src={author.avatarUrl || 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=User '} 
                    alt={author.name || 'Anonymous'} 
                    className="avatar-img"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=User '; }} // Fallback nếu load lỗi
                />
            </div>
            <div className="comment-content">
                <div className="comment-header">
                    <span className="author-name">{author.name || 'Anonymous'}</span>
                    <span className="comment-time">{formatDate(createdAt)}</span>
                </div>
                <p className="comment-text">{content}</p>
                <div className="comment-actions">
                    <button 
                        onClick={handleLike} 
                        disabled={isLiking || isDeleting}
                        className={`action-button like-button ${isLiked ? 'liked' : ''}`}
                        title="Like comment"
                    >
                        <span className="action-icon">
                            {isLiking ? (
                                <svg className="spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            )}
                        </span>
                        <span className="action-text">Like ({likesCount})</span>
                    </button>
                    <button 
                        onClick={handleReply} 
                        disabled={isLiking || isDeleting}
                        className="action-button reply-button"
                        title="Reply to comment"
                    >
                        <span className="action-icon">
                            <svg className="reply-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </span>
                        <span className="action-text">Reply</span>
                    </button>
                    {isOwner && (
                        <button 
                            onClick={handleDelete} 
                            disabled={isDeleting || isLiking}
                            className="action-button delete-button"
                            title="Delete comment"
                        >
                            <span className="action-icon">
                                {isDeleting ? (
                                    <svg className="spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
                                    </svg>
                                )}
                            </span>
                            <span className="action-text">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Utils đơn giản nếu chưa có (formatDate)
// const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', { 
//         month: 'short', 
//         day: 'numeric', 
//         hour: '2-digit', 
//         minute: '2-digit' 
//     });
// };

export default CommentItem;
