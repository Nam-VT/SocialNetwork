// src/features/post/PostList.jsx

import { useState } from 'react';
import { useGetPostsQuery } from './postApiSlice';
import PostItem from './PostItem';
import '../../styles/PostList.css';

const PostList = () => {
    const [page, setPage] = useState(0);

    const {
        data: postsData,
        isLoading,
        isFetching,
        isSuccess,
        isError,
    } = useGetPostsQuery({ page, size: 10 });

    const handleLoadMore = () => {
        if (postsData && !postsData.last) {
            setPage(prevPage => prevPage + 1);
        }
    };

    let content;

    if (isLoading) {
        content = (
            <div className="list-loading">
                <div className="spinner-medium"></div>
                <span className="loading-text">Loading posts...</span>
            </div>
        );
    } else if (isSuccess) {
        const posts = postsData?.content ?? [];
        content = (
            <>
                <div className="posts-container">
                    {posts.map(post => <PostItem key={post.id} post={post} />)}
                </div>
                
                <div className="load-more-section">
                    {postsData?.last === false && (
                        <button onClick={handleLoadMore} disabled={isFetching} className="load-more-button">
                            <span className="button-content">
                                {isFetching ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        <span>Loading more...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="button-icon">
                                            <svg className="load-icon" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <span>Load More</span>
                                    </>
                                )}
                            </span>
                        </button>
                    )}
                    {postsData?.last === true && posts.length > 0 && (
                        <div className="end-state">
                            <div className="end-icon">
                                <svg className="end-svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="end-text">You have reached the end.</p>
                        </div>
                    )}
                    {posts.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg className="empty-svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="empty-text">No posts to show.</p>
                        </div>
                    )}
                </div>
            </>
        );
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

    return <div className="post-list">{content}</div>;
};

export default PostList;