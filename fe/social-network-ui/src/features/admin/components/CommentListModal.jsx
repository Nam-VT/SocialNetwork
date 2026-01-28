import React, { useState } from 'react';
import { useGetCommentsByPostQuery, useDeleteCommentMutation } from '../adminApiSlice';

const CommentListModal = ({ postId, isOpen, onClose }) => {
    const [page, setPage] = useState(0);
    const { data: commentsData, isLoading, isError, refetch } = useGetCommentsByPostQuery(
        { postId, page, size: 10 },
        { skip: !isOpen || !postId }
    );
    const [deleteComment] = useDeleteCommentMutation();

    if (!isOpen) return null;

    const handleDelete = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteComment(commentId).unwrap();
                alert('Comment deleted successfully');
                refetch();
            } catch (error) {
                console.error('Failed to delete comment:', error);
                alert('Failed to delete comment');
            }
        }
    };

    return (
        <div className="modal-overlay" style={modalOverlayStyle}>
            <div className="modal-content" style={modalContentStyle}>
                <div className="modal-header" style={modalHeaderStyle}>
                    <h2>Comments for Post</h2>
                    <button onClick={onClose} style={closeButtonStyle}>×</button>
                </div>

                <div className="modal-body" style={modalBodyStyle}>
                    {isLoading ? (
                        <p>Loading comments...</p>
                    ) : isError ? (
                        <p style={{ color: 'red' }}>Error loading comments.</p>
                    ) : commentsData?.content?.length === 0 ? (
                        <p>No comments found for this post.</p>
                    ) : (
                        <div className="comment-list">
                            {commentsData?.content.map(comment => (
                                <div key={comment.id} className="comment-item" style={commentItemStyle}>
                                    <div className="comment-info">
                                        <strong>{comment.userId}</strong>
                                        <p style={{ margin: '4px 0' }}>{comment.content}</p>
                                        <small style={{ color: '#888' }}>{new Date(comment.createdAt).toLocaleString()}</small>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        style={deleteButtonStyle}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Simple Pagination */}
                {commentsData?.totalPages > 1 && (
                    <div className="pagination" style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                        <span>{page + 1} / {commentsData.totalPages}</span>
                        <button disabled={page >= commentsData.totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple inline styles to ensure it works without external CSS file dependency for now
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    width: '600px',
    maxWidth: '90%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px'
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer'
};

const modalBodyStyle = {
    flex: 1,
    overflowY: 'auto'
};

const commentItemStyle = {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const deleteButtonStyle = {
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
};

export default CommentListModal;
