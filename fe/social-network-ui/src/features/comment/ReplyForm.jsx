import { useState } from 'react';
import { useCreateCommentMutation } from './commentApiSlice';
import '../../styles/ReplyForm.css';

const ReplyForm = ({ postId, parentCommentId, onReplySuccess, onCancel }) => {
    const [content, setContent] = useState('');
    const [createComment, { isLoading }] = useCreateCommentMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await createComment({ postId, parentCommentId, content }).unwrap();
            setContent('');
            if (onReplySuccess) onReplySuccess();
        } catch (err) {
            console.error('Failed to reply:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form-minimal reply-mode">
            <input
                type="text"
                className="comment-input-minimal"
                placeholder="Write a reply..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                autoFocus
            />
            <button
                type="submit"
                className="comment-submit-minimal"
                disabled={isLoading || !content.trim()}
                title="Reply"
            >
                {isLoading ? (
                    <div className="spinner-minimal"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                    </svg>
                )}
            </button>
            <button
                type="button"
                className="comment-cancel-minimal"
                onClick={onCancel}
                title="Cancel"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </form>
    );
};

export default ReplyForm;