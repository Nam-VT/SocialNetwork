import { useState, useEffect } from 'react';
import { useGetFeedPostsQuery } from './postApiSlice';
import PostItem from './PostItem';
import '../../styles/PostList.css';

const PostList = () => {
    const [page, setPage] = useState(0);
    const [allPosts, setAllPosts] = useState([]);

    const {
        data: postsData,
        isLoading,
        isFetching,
        isSuccess,
        isError,
    } = useGetFeedPostsQuery({ page, size: 10 });

    // Khi có dữ liệu mới, append vào allPosts
    useEffect(() => {
        if (isSuccess && postsData?.content) {
            setAllPosts(prevPosts => {
                // Tránh trùng lặp bài viết (theo id)
                const newPosts = postsData.content.filter(
                    p => !prevPosts.some(prev => prev.id === p.id)
                );
                return [...prevPosts, ...newPosts];
            });
        }
    }, [postsData, isSuccess]);

    const handleLoadMore = () => {
        if (postsData && !postsData.last && !isFetching) {
            setPage(prevPage => prevPage + 1);
        }
    };

    let content;

    if (isLoading && page === 0) {
        content = <p className="loading-text">Loading your feed...</p>;
    } else if (isError) {
        content = <p className="error-text">Could not load your feed.</p>;
    } else {
        content = (
            <>
                {allPosts.length > 0 ? (
                    <div className="posts-container">
                        {allPosts.map(post => (
                            <PostItem key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">
                        Your feed is empty. Follow some users to see their posts here!
                    </p>
                )}

                <div className="load-more-section">
                    {!postsData?.last && allPosts.length > 0 && (
                        <button
                            onClick={handleLoadMore}
                            disabled={isFetching}
                            aria-busy={isFetching}
                            aria-disabled={isFetching}
                            className="load-more-button"
                        >
                            {isFetching ? 'Loading more...' : 'Load More'}
                        </button>
                    )}
                    {postsData?.last && allPosts.length > 0 && (
                        <p className="end-text">You have reached the end of your feed.</p>
                    )}
                </div>
            </>
        );
    }

    return <div className="post-list">{content}</div>;
};

export default PostList;