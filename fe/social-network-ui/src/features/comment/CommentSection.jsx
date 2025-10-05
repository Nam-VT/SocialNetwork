import { useGetCommentsByPostQuery } from './commentApiSlice';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm'; // Giả sử có component này
import '../../styles/CommentSection.css';

const CommentSection = ({ postId }) => {
    const {
        data: commentsData,
        isLoading,
        isSuccess,
        isError,
    } = useGetCommentsByPostQuery({ postId });

    let content;

    if (isLoading) {
        content = <div className="comments-loading">Loading comments...</div>;
    } else if (isSuccess) {
        const comments = commentsData?.content || [];
        content = (
            <div className="comments-list">
                {comments.length > 0 
                    ? comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                      ))
                    : <p className="comments-empty">No comments yet.</p>
                }
            </div>
        );
    } else if (isError) {
        content = <div className="comments-error">Error loading comments.</div>;
    }

    return (
        <section className="comment-section">
            <h3 className="comment-section-title">Comments</h3>
            <CommentForm postId={postId} />
            <div className="comment-section-content">
                {content}
            </div>
        </section>
    );
};

export default CommentSection;
