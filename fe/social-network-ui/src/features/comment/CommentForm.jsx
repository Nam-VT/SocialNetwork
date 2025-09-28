import { useState } from 'react';
import { useCreateCommentMutation } from './commentApiSlice';
import '../../styles/CommentForm.css';

const CommentForm = ({ postId }) => {
    const [content, setContent] = useState('');
    
    const [createComment, { isLoading, isError }] = useCreateCommentMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return; // Không gửi comment rỗng

        try {
            // Body cần khớp với API của bạn
            await createComment({ postId, content }).unwrap();
            setContent(''); // Xóa nội dung input sau khi gửi thành công
        } catch (err) {
            console.error('Failed to create comment:', err);
        }
    };

    return (
        <div className="comment-container">
            <div className="comment-header">
                <h3 className="comment-title">Add a comment</h3>
                <p className="comment-subtitle">Share your thoughts on this post.</p>
            </div>
            <div className="comment-card">
                <form onSubmit={handleSubmit} className="comment-form">
                    {isError && (
                        <div className="error-alert">
                            <div className="error-icon">
                                <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="error-message">
                                <p>Failed to post comment. Please try again.</p>
                            </div>
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="comment-content" className="form-label">Your comment</label>
                        <textarea
                            id="comment-content"
                            className="form-textarea"
                            rows="3"
                            placeholder="Write a comment..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isLoading}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading || !content.trim()}
                    >
                        <span className="button-icon">
                            {isLoading && (
                                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                        </span>
                        {isLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommentForm;
