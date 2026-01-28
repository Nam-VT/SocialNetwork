import { useState, useEffect } from 'react';
import { useGetFeedPostsQuery } from './postApiSlice';
import PostItem from './PostItem';
import '../../styles/PostList.css';

const PostList = () => {
    const [page, setPage] = useState(0);

    console.log('🔍 PostList component mounted, calling useGetFeedPostsQuery...');

    const {
        data: postsData,
        isLoading,
        isFetching,
        isSuccess,
        isError,
    } = useGetFeedPostsQuery({ page, size: 10 });

    console.log('📊 Feed Query Status:', { isLoading, isFetching, isSuccess, isError, postsData });

    const handleLoadMore = () => {
        if (postsData && !postsData.last && !isFetching) {
            setPage(prevPage => prevPage + 1);
        }
    };

    let content;

    if (isLoading && !postsData) {
        content = <p className="loading-text">Loading your feed...</p>;
    } else if (isError) {
        content = <p className="error-text">Could not load your feed.</p>;
    } else if (isSuccess && postsData?.content) {
        // Trực tiếp sử dụng postsData.content để render
        const allPostsFromCache = postsData.content;
        content = (
            <>
                {allPostsFromCache.length > 0 ? (
                    <div className="posts-container">
                        {allPostsFromCache.map(post => (
                            <PostItem key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">
                        Your feed is empty. Follow some users to see their posts here!
                    </p>
                )}

                <div className="load-more-section">
                    {/* isFetching cho biết có request đang chạy dưới nền (kể cả khi load more) */}
                    {!postsData?.last && allPostsFromCache.length > 0 && (
                        <button
                            onClick={handleLoadMore}
                            disabled={isFetching}
                            className="load-more-button"
                        >
                            {isFetching ? 'Loading more...' : 'Load More'}
                        </button>
                    )}
                    {postsData?.last && allPostsFromCache.length > 0 && (
                        <p className="end-text">You have reached the end of your feed.</p>
                    )}
                </div>
            </>
        );
    }

    return <div className="post-list">{content}</div>;
};

export default PostList;