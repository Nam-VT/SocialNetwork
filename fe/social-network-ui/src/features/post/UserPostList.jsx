import { useState } from 'react'; // <-- Thêm useState
import { useGetPostsByUserIdQuery } from './postApiSlice';
import PostItem from './PostItem';
import '../../styles/UserPostList.css';

const UserPostList = ({ userId }) => {
    const [page, setPage] = useState(0); // <-- Thêm state cho page

    const {
        data: postsData,
        isLoading,
        isFetching,
        isSuccess,
        isError,
    } = useGetPostsByUserIdQuery({ userId, page, size: 9 }, { skip: !userId });

    const handleLoadMore = () => {
        if (postsData && !postsData.last && !isFetching) {
            setPage(prevPage => prevPage + 1);
        }
    };

    let content;
    if (isLoading && !postsData) {
        content = <div className="list-loading">{/* ... spinner ... */}</div>;
    } else if (isSuccess && postsData?.content) {
        const allPosts = postsData.content;
        if (allPosts.length > 0) {
            content = (
                <>
                    <div className="posts-grid">
                        {allPosts.map(post => <PostItem key={post.id} post={post} />)}
                    </div>
                    <div className="load-more-section">
                        {!postsData.last && (
                            <button onClick={handleLoadMore} disabled={isFetching} className="load-more-button">
                                {isFetching ? 'Loading...' : 'Load More Posts'}
                            </button>
                        )}
                    </div>
                </>
            );
        } else {
            content = <div className="empty-state">{/* ... empty state UI ... */}</div>;
        }
    } else if (isError) {
        content = <div className="list-error">{/* ... error UI ... */}</div>;
    }

    return (
        <div className="user-post-list">
            <h2 className="list-header">Posts</h2>
            {content}
        </div>
    );
};

export default UserPostList;