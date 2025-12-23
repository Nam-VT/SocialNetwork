import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLazySearchUsersQuery, useLazySearchPostsQuery } from '../features/search/searchApiSlice';
import UserSearchResultItem from '../features/user/UserSearchResultItem';
import PostItem from '../features/post/PostItem';
import '../styles/SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [activeTab, setActiveTab] = useState('users');

    // Bóc tách thêm isFetching để UI mượt mà khi chuyển trang hoặc search lại
    const [triggerSearchUsers, { 
        data: usersData, 
        isLoading: isLoadingUsers, 
        isFetching: isFetchingUsers,
        isError: isErrorUsers 
    }] = useLazySearchUsersQuery();

    const [triggerSearchPosts, { 
        data: postsData, 
        isLoading: isLoadingPosts, 
        isFetching: isFetchingPosts,
        isError: isErrorPosts 
    }] = useLazySearchPostsQuery();

    useEffect(() => {
        if (query) {
            triggerSearchUsers({ query });
            triggerSearchPosts({ query });
        }
    }, [query, triggerSearchUsers, triggerSearchPosts]);

    if (!query) {
        return (
            <div className="search-page-empty">
                <div className="empty-icon">🔍</div>
                <p>Please enter a keyword to search for users or posts.</p>
            </div>
        );
    }

    // Logic xác định trạng thái hiển thị
    const isLoading = activeTab === 'users' ? (isLoadingUsers || isFetchingUsers) : (isLoadingPosts || isFetchingPosts);
    const isError = activeTab === 'users' ? isErrorUsers : isErrorPosts;
    const results = activeTab === 'users' ? (usersData?.content || []) : (postsData?.content || []);

    const renderSkeleton = () => (
        <div className="results-skeleton">
            {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-item">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="search-page" role="main">
            <div className="search-header">
                <h1 className="search-title">Results for "<span>{query}</span>"</h1>
            </div>

            <nav className="search-tabs" role="tablist">
                <button 
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                    role="tab"
                >
                    Users 
                    <span className="tab-count">{usersData?.totalElements || 0}</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                    role="tab"
                >
                    Posts 
                    <span className="tab-count">{postsData?.totalElements || 0}</span>
                </button>
            </nav>

            <div className="search-results-container">
                {isLoading ? (
                    renderSkeleton()
                ) : isError ? (
                    <div className="results-error">
                        <p>Something went wrong while searching.</p>
                        <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
                    </div>
                ) : results.length === 0 ? (
                    <div className="results-empty">
                        <div className="empty-img">🌵</div>
                        <p>No {activeTab} found matching "{query}".</p>
                    </div>
                ) : (
                    <div className={activeTab === 'users' ? "user-results-grid" : "post-results-list"}>
                        {activeTab === 'users' ? (
                            results.map(user => (
                                <UserSearchResultItem key={user.id} user={user} />
                            ))
                        ) : (
                            results.map(post => (
                                <PostItem key={post.id} post={post} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;