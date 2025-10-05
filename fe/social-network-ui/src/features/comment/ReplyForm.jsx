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
        <form onSubmit={handleSubmit} className="reply-form">
            <textarea
                className="reply-textarea"
                placeholder="Write a reply..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                rows={2}
                autoFocus
                aria-label="Write a reply"
            />
            <div className="reply-form-actions">
                <button type="submit" disabled={isLoading} className="btn btn-primary">
                    {isLoading ? 'Replying...' : 'Reply'}
                </button>
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ReplyForm;