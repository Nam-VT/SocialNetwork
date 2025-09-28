// src/features/post/UserPostList.jsx

import { useGetPostsByUserIdQuery } from './postApiSlice';
import PostItem from './PostItem';
import '../../styles/UserPostList.css';

const UserPostList = ({ userId }) => {
    const {
        data: posts,
        isLoading,
        isSuccess,
        isError,
    } = useGetPostsByUserIdQuery(userId, { skip: !userId });

    let content;
    if (isLoading) {
        content = (
            <div className="list-loading">
                <div className="spinner-medium"></div>
                <span className="loading-text">Loading posts...</span>
            </div>
        );
    } else if (isSuccess) {
        if (posts && posts.length > 0) {
            content = (
                <div className="posts-grid">
                    {posts.map(post => <PostItem key={post.id} post={post} />)}
                </div>
            );
        } else {
            content = (
                <div className="empty-state">
                    <div className="empty-icon">
                        <svg className="empty-svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="empty-text">This user hasn't posted anything yet.</p>
                </div>
            );
        }
    } else if (isError) {
        content = (
            <div className="list-error">
                <div className="error-icon">
                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="error-text">Could not load posts.</span>
            </div>
        );
    }

    return (
        <div className="user-post-list">
            <h2 className="list-header">Posts</h2>
            {content}
        </div>
    );
};

export default UserPostList;