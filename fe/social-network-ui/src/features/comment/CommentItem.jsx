import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetCommentRepliesQuery,
    useToggleCommentLikeMutation,
    useDeleteCommentMutation,
    useUpdateCommentMutation,
} from './commentApiSlice';
import { selectCurrentUser } from '../auth/authSlice';
import ReplyForm from './ReplyForm';
import { useGetUserByIdQuery } from '../user/userApiSlice';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import '../../styles/CommentItem.css';

const CommentItem = ({ comment }) => {
    // Thêm isLiked từ prop
    const { id, content, userId, postId, createdAt, likeCount, isLiked, parentCommentId } = comment;
    const currentUser = useSelector(selectCurrentUser);
    const isOwner = currentUser?.id === userId;
    const { data: author } = useGetUserByIdQuery(userId);
    const initial = author?.displayName?.charAt(0).toUpperCase() || 'U';

    const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const optionsRef = useRef(null);
    useClickOutside(optionsRef, () => setIsOptionsVisible(false));

    // Logic phân trang cho Replies
    const [page, setPage] = useState(0);
    const { data: repliesData, isFetching: isFetchingReplies } = useGetCommentRepliesQuery({ parentId: id, page });

    // Hooks cho các mutation
    const [toggleCommentLike] = useToggleCommentLikeMutation();
    const [deleteComment] = useDeleteCommentMutation();
    const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();

    useEffect(() => {
        setEditedContent(content);
    }, [content]);

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
            try {
                await deleteComment({ id, postId, parentCommentId }).unwrap();
            } catch (err) {
                console.error('Failed to delete comment:', err);
                const errorMessage = err?.data?.message || err?.error || "Xóa bình luận thất bại.";
                alert(errorMessage);
            }
        }
    };

    const handleLike = async () => {
        try {
            // Truyền thêm dữ liệu ngữ cảnh
            await toggleCommentLike({ commentId: id, postId, parentCommentId }).unwrap();
        } catch (err) {
            console.error('Failed to toggle comment like:', err);
        }
    };

    const handleUpdate = async () => {
        if (editedContent.trim() && editedContent !== content) {
            try {
                await updateComment({ id, content: editedContent, postId, parentCommentId }).unwrap();
                setIsEditing(false);
            } catch (err) {
                console.error("Failed to update comment", err);
                const errorMessage = err?.data?.message || err?.error || "Cập nhật bình luận thất bại.";
                alert(errorMessage); // Notify user
            }
        } else {
            setIsEditing(false); // Hủy nếu không thay đổi
        }
    };

    return (
        <div className="comment-item">
            <div className="comment-main">
                {/* 1. Avatar Column */}
                <div className="comment-avatar-container">
                    <Link to={`/profile/${userId}`}>
                        <img
                            src={author?.avatarUrl || `https://ui-avatars.com/api/?name=${initial}&size=32&background=random`}
                            alt="Avatar"
                            className="comment-avatar"
                            width={32}
                            height={32}
                            loading="lazy"
                        />
                    </Link>
                </div>

                {/* 2. Content Column */}
                <div className="comment-body">
                    <div className="comment-bubble-wrapper">
                        <div className="comment-bubble">
                            <Link to={`/profile/${userId}`} className="comment-author-name">
                                {author?.displayName || 'Unknown User'}
                            </Link>

                            {isEditing ? (
                                <div className="comment-edit-form">
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        autoFocus
                                        rows={2}
                                    />
                                    <div className="edit-actions">
                                        <button onClick={handleUpdate} disabled={isUpdating}>{isUpdating ? 'Lưu' : 'Lưu'}</button>
                                        <button onClick={() => setIsEditing(false)}>Hủy</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="comment-content-text">{content}</p>
                            )}
                        </div>

                        {/* Options Menu (Three dots) - Positioned relative to bubble or row */}
                        {isOwner && !isEditing && (
                            <div className="comment-options" ref={optionsRef}>
                                <button
                                    className="options-btn"
                                    onClick={() => setIsOptionsVisible(prev => !prev)}
                                >
                                    •••
                                </button>
                                {isOptionsVisible && (
                                    <div className="options-menu">
                                        <button onClick={() => { setIsEditing(true); setIsOptionsVisible(false); }}>Chỉnh sửa</button>
                                        <button onClick={handleDelete}>Xóa</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. Actions Row (Below Bubble) */}
                    <div className="comment-actions">
                        <span className="comment-time">{new Date(createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}</span>
                        <button onClick={handleLike} className={`btn-action ${isLiked ? 'liked' : ''}`}>
                            Thích
                        </button>
                        <button onClick={() => setIsReplyFormVisible(prev => !prev)} className="btn-action">
                            Trả lời
                        </button>
                        {likeCount > 0 && (
                            <div className="comment-like-count">
                                <span className="like-icon-small">❤️</span> {likeCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isReplyFormVisible && (
                <ReplyForm
                    postId={postId}
                    parentCommentId={id}
                    onReplySuccess={() => setIsReplyFormVisible(false)}
                    onCancel={() => setIsReplyFormVisible(false)}
                />
            )}

            {repliesData && repliesData.content.length > 0 && (
                <div className="comment-replies">
                    {repliesData.content.map(reply => (
                        <CommentItem key={reply.id} comment={reply} />
                    ))}
                    {!repliesData.last && (
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={isFetchingReplies}
                            className="btn-view-more"
                        >
                            {isFetchingReplies ? 'Loading...' : 'View more replies'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentItem;