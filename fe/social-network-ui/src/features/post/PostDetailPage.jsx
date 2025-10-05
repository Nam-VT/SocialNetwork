import { useParams } from 'react-router-dom';
import { useGetPostByIdQuery } from '../../features/post/postApiSlice';
import PostItem from './PostItem';
import CommentSection from '../comment/CommentSection';
import '../../styles/PostDetailPage.css';  // Import CSS

const PostDetailPage = () => {
    const { postId } = useParams();

    const {
        data: post,
        isLoading,
        isSuccess,
        isError,
    } = useGetPostByIdQuery(postId);

    let content;

    if (isLoading) {
        content = <p>Loading post...</p>;
    } else if (isSuccess) {
        content = (
            <div>
                <PostItem post={post} isDetailView={true} />

                <div className="comment-section-wrapper">
                    <CommentSection postId={postId} />
                </div>
            </div>
        );
    } else if (isError) {
        content = <p>Could not find this post.</p>;
    }

    return (
        <main className="post-detail-container">
            <h1 className="post-detail-title">Post Details</h1>
            {content}
        </main>
    );
};

export default PostDetailPage;
