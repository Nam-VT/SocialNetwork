import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLazySearchUsersQuery, useLazySearchPostsQuery } from '../features/search/searchApiSlice';
import UserSearchResultItem from '../features/user/UserSearchResultItem';
import PostItem from '../features/post/PostItem';
import '../styles/SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q'); // Lấy từ khóa từ URL
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'posts'

    // Dùng Lazy Query để gọi API khi query thay đổi
    const [triggerSearchUsers, { 
        data: usersData, 
        isLoading: isLoadingUsers, 
        isError: isErrorUsers 
    }] = useLazySearchUsersQuery();

    const [triggerSearchPosts, { 
        data: postsData, 
        isLoading: isLoadingPosts, 
        isError: isErrorPosts 
    }] = useLazySearchPostsQuery();

    // Gọi API mỗi khi query thay đổi
    useEffect(() => {
        if (query) {
            triggerSearchUsers({ query });
            triggerSearchPosts({ query });
        }
    }, [query, triggerSearchUsers, triggerSearchPosts]);

    if (!query) {
        return <div className="search-page-empty">Please enter a keyword to search.</div>;
    }

    // Xác định data hiển thị dựa trên tab đang chọn
    const isLoading = activeTab === 'users' ? (isLoadingUsers || isFetchingUsers) : (isLoadingPosts || isFetchingPosts);
    const isError = activeTab === 'users' ? isErrorUsers : isErrorPosts;
    const results = activeTab === 'users' ? (usersData?.content || []) : (postsData?.content || []);
    const totalCount = activeTab === 'users' ? (usersData?.totalElements || 0) : (postsData?.totalElements || 0);

    const renderSkeleton = () => (
        <div className="results-skeleton">
            {[1, 2, 3].map((n) => (
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
                <h1 className="search-title">Results for "{query}"</h1>
            </div>

            <nav className="search-tabs" role="tablist" aria-label="Search results tabs">
                <button 
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                    role="tab"
                    aria-selected={activeTab === 'users'}
                >
                    Users 
                    <span className="tab-count">{usersData?.totalElements || 0}</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                    role="tab"
                    aria-selected={activeTab === 'posts'}
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