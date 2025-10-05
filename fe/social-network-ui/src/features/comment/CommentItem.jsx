import { useState } from 'react';
import { useGetCommentRepliesQuery } from './commentApiSlice';
import ReplyForm from './ReplyForm';
import CommentAuthorInfo from './CommentAuthorInfo';
import '../../styles/CommentItem.css';

const CommentItem = ({ comment }) => {
    const { id, content, userId, postId, createdAt, likeCount } = comment;

    const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);

    const { data: repliesData } = useGetCommentRepliesQuery({ parentId: id });

    return (
        <div className="comment-item">
            <div className="comment-main">
                <div className="comment-author">
                    <CommentAuthorInfo userId={userId} />
                </div>
                <div className="comment-content-wrapper">
                    <div className="comment-content-box">
                        <p className="comment-content-text">{content}</p>
                    </div>
                    <div className="comment-actions">
                        <button type="button" className="btn-like">
                            Like ({likeCount})
                        </button>
                        <button
                            type="button"
                            className="btn-reply"
                            onClick={() => setIsReplyFormVisible(prev => !prev)}
                        >
                            Reply
                        </button>
                        <span className="comment-time">
                            {new Date(createdAt).toLocaleTimeString()}
                        </span>
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
                    {/* <button className="btn-view-more">View more replies</button> */}
                </div>
            )}
        </div>
    );
};

export default CommentItem;