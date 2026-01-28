import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLazySearchUsersQuery, useLazySearchPostsQuery } from '../features/search/searchApiSlice';
import UserSearchResultItem from '../features/user/UserSearchResultItem';
import PostItem from '../features/post/PostItem';
import '../styles/SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryParam = searchParams.get('q');
    const [searchInput, setSearchInput] = useState(queryParam || '');
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
        if (queryParam) {
            setSearchInput(queryParam);
            triggerSearchUsers({ query: queryParam });
            triggerSearchPosts({ query: queryParam });
        }
    }, [queryParam, triggerSearchUsers, triggerSearchPosts]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/ search ? q = ${encodeURIComponent(searchInput.trim())} `);
        }
    };

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
            {/* Header with Title only */}
            <div className="search-header">
                {queryParam ? (
                    <h2 className="search-title">
                        Results for "<span>{queryParam}</span>"
                    </h2>
                ) : (
                    <h2 className="search-title">Search</h2>
                )}
            </div>

            {!queryParam ? (
                <div className="search-page-empty">
                    <div className="empty-icon">🔍</div>
                    <h3>Start Searching</h3>
                    <p>Enter a keyword above to find people or posts</p>
                </div>
            ) : (
                <>
                    <nav className="search-tabs" role="tablist">
                        <button
                            className={`tab - button ${activeTab === 'users' ? 'active' : ''} `}
                            onClick={() => setActiveTab('users')}
                            role="tab"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            People
                            <span className="tab-count">{usersData?.totalElements ?? (usersData?.content?.length || 0)}</span>
                        </button>
                        <button
                            className={`tab - button ${activeTab === 'posts' ? 'active' : ''} `}
                            onClick={() => setActiveTab('posts')}
                            role="tab"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Posts
                            <span className="tab-count">{postsData?.totalElements ?? (postsData?.content?.length || 0)}</span>
                        </button>
                    </nav>

                    <div className="search-results-container">
                        {isLoading ? (
                            renderSkeleton()
                        ) : isError ? (
                            <div className="results-error">
                                <div className="error-icon">⚠️</div>
                                <p>Something went wrong while searching</p>
                                <button onClick={() => window.location.reload()} className="retry-button">
                                    Try Again
                                </button>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="results-empty">
                                <div className="empty-img">🌵</div>
                                <h3>No {activeTab === 'users' ? 'People' : 'Posts'} Found</h3>
                                <p>We couldn't find any {activeTab} matching "<strong>{queryParam}</strong>"</p>
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
                </>
            )}
        </div>
    );
};

export default SearchPage;