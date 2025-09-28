import { useGetCommentsByPostQuery } from './commentApiSlice';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import '../../styles/CommentSection.css'; // Import từ folder styles tập trung (điều chỉnh path nếu cần)

const CommentSection = ({ postId }) => {
    // Gọi hook query để lấy dữ liệu
    const {
        data: commentsData, // Đổi tên `data` thành `commentsData` để rõ nghĩa
        isLoading,
        isSuccess,
        isError,
        error,
    } = useGetCommentsByPostQuery({ postId });

    let content;

    if (isLoading) {
        content = (
            <div className="loading-container">
                <div className="spinner-large"></div>
                <p className="loading-text">Loading comments...</p>
            </div>
        );
    } else if (isSuccess) {
        // Giả sử API trả về { content: [...], totalPages: ... }
        const comments = commentsData?.content || [];
        const commentCount = comments.length; // Hoặc commentsData?.totalCount nếu API có

        if (comments.length > 0) {
            content = (
                <div className="comments-list">
                    {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            );
        } else {
            content = (
                <div className="empty-state">
                    <div className="empty-icon">
                        <svg className="empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            <path d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
                        </svg>
                    </div>
                    <p className="empty-text">No comments yet. Be the first to comment!</p>
                </div>
            );
        }
    } else if (isError) {
        content = (
            <div className="error-alert">
                <div className="error-icon">
                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="error-message">
                    <p>Failed to load comments. Please try refreshing the page.</p>
                </div>
            </div>
        );
    }

    const commentCount = isSuccess ? (commentsData?.content?.length || 0) : 0;

    return (
        <div className="comment-section">
            <div className="comment-header">
                <h3 className="section-title">Comments</h3>
                <span className="comment-count">{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
            
            {/* Form để thêm comment mới */}
            <div className="comment-form-wrapper">
                <CommentForm postId={postId} />
            </div>

            {/* Vùng hiển thị danh sách comment */}
            <div className="comments-container">
                {content}
            </div>
        </div>
    );
};

export default CommentSection;