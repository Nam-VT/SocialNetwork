import { useState } from 'react';
import { useCreateCommentMutation } from './commentApiSlice';
import '../../styles/CommentForm.css';

const CommentForm = ({ postId, postOwnerId }) => {
    const [content, setContent] = useState('');
    const [createComment, { isLoading }] = useCreateCommentMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await createComment({ postId, content, postOwnerId }).unwrap();
            setContent('');
        } catch (err) {
            console.error('Failed to create comment:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form-minimal">
            <input
                type="text"
                className="comment-input-minimal"
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
            />
            <button
                type="submit"
                className="comment-submit-minimal"
                disabled={isLoading || !content.trim()}
                title="Post Comment"
            >
                {isLoading ? (
                    <div className="spinner-minimal"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                    </svg>
                )}
            </button>
        </form>
    );
};

export default CommentForm;
