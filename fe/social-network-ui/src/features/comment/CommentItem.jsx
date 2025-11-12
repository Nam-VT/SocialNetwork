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
import CommentAuthorInfo from './CommentAuthorInfo';
import { useClickOutside } from '../../hooks/useClickOutside';
import '../../styles/CommentItem.css';

const CommentItem = ({ comment }) => {
    // Thêm isLiked từ prop
    const { id, content, userId, postId, createdAt, likeCount, isLiked, parentCommentId } = comment;
    const currentUser = useSelector(selectCurrentUser);
    const isOwner = currentUser?.id === userId;

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

    const handleLike = () => {
        toggleCommentLike({ commentId: id, postId, parentCommentId });
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            await deleteComment({ id, postId, parentCommentId });
        }
    };

    const handleUpdate = async () => {
        if (editedContent.trim() && editedContent !== content) {
            try {
                await updateComment({ id, content: editedContent, postId, parentCommentId }).unwrap();
                setIsEditing(false);
            } catch (err) {
                console.error("Failed to update comment", err);
            }
        } else {
            setIsEditing(false); // Hủy nếu không thay đổi
        }
    };

    return (
        <div className="comment-item">
            <div className="comment-main">
                <CommentAuthorInfo userId={userId} />
                <div className="comment-content-wrapper">
                    {isEditing ? (
                        <div className="comment-edit-form">
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                autoFocus
                            />
                            <div className="edit-actions">
                                <button onClick={handleUpdate} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save'}</button>
                                <button onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <p className="comment-content-text">{content}</p>
                    )}

                    <div className="comment-actions">
                        <button onClick={handleLike} className={`btn-like ${isLiked ? 'liked' : ''}`}>
                            {isLiked ? 'Liked' : 'Like'} ({likeCount})
                        </button>
                        <button onClick={() => setIsReplyFormVisible(prev => !prev)} className="btn-reply">
                            Reply
                        </button>
                        <span className="comment-time">{new Date(createdAt).toLocaleString()}</span>

                        {isOwner && !isEditing && (
                            <div className="owner-actions-container" ref={optionsRef}>
                                <button 
                                    className="options-button" 
                                    onClick={() => setIsOptionsVisible(prev => !prev)}
                                    aria-label="More options"
                                    title="More"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
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