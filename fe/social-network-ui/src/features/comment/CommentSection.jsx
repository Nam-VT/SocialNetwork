import { useState } from 'react';
import { useGetCommentsByPostQuery } from './commentApiSlice';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import '../../styles/CommentSection.css';

const CommentSection = ({ postId }) => {
    const [page, setPage] = useState(0);

    const {
        data: commentsData,
        isLoading,
        isFetching,
        isSuccess,
        isError,
    } = useGetCommentsByPostQuery({ postId, page });

    const handleLoadMore = () => {
        if (commentsData && !commentsData.last && !isFetching) {
            setPage(prevPage => prevPage + 1);
        }
    };

    let listContent;

    if (isLoading && !commentsData) {
        listContent = <div className="comments-loading">Loading comments...</div>;
    } else if (isSuccess && commentsData?.content) {
        const comments = commentsData.content;
        listContent = (
            <>
                <div className="comments-list">
                    {comments.length > 0 
                        ? comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                          ))
                        : <p className="comments-empty">Be the first to comment.</p>
                    }
                </div>
                {commentsData && !commentsData.last && comments.length > 0 && (
                    <button onClick={handleLoadMore} disabled={isFetching} className="load-more-btn">
                        {isFetching ? 'Loading...' : 'Load More Comments'}
                    </button>
                )}
            </>
        );
    } else if (isError) {
        listContent = <div className="comments-error">Error loading comments.</div>;
    }

    return (
        <section className="comment-section">
            <h3 className="comment-section-title">Comments</h3>
            
            {/* SỬA LẠI BỐ CỤC: Hiển thị danh sách comment TRƯỚC */}
            <div className="comment-section-content">
                {listContent}
            </div>

            {/* SỬA LẠI BỐ CỤC: Form nhập comment nằm ở DƯỚI CÙNG */}
            <CommentForm postId={postId} />
        </section>
    );
};

export default CommentSection;