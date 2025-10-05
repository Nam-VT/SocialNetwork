import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLazySearchUsersQuery, useLazySearchPostsQuery } from '../features/search/searchApiSlice';
import UserSearchResultItem from '../features/user/UserSearchResultItem';
import PostItem from '../features/post/PostItem';
import '../styles/SearchPage.css';

const SearchPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    const [triggerSearchUsers, { data: usersData, isLoading: isLoadingUsers, isError: isErrorUsers }] = useLazySearchUsersQuery();
    const [triggerSearchPosts, { data: postsData, isLoading: isLoadingPosts, isError: isErrorPosts }] = useLazySearchPostsQuery();

    useEffect(() => {
        if (query) {
            triggerSearchUsers({ query });
            triggerSearchPosts({ query });
        }
    }, [query, triggerSearchUsers, triggerSearchPosts]);

    if (!query) {
        return (
            <div className="search-page-empty">
                <h1>Search Results</h1>
                <p>Please enter a search term in the navigation bar to begin.</p>
            </div>
        );
    }

    const isLoading = activeTab === 'users' ? isLoadingUsers : isLoadingPosts;
    const isError = activeTab === 'users' ? isErrorUsers : isErrorPosts;
    const resultsData = activeTab === 'users' ? usersData : postsData;
    const totalCount = resultsData?.totalElements ?? 0;
    const resultsContent = resultsData?.content ?? [];

    const renderSkeleton = () => (
        <div className="results-skeleton">
            {[...Array(5)].map((_, index) => (
                <div key={index} className="skeleton-item">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-content"></div>
                </div>
            ))}
        </div>
    );

    const renderEmpty = () => (
        <div className="results-empty">
            <span className="empty-icon">🔍</span>
            <h3>No {activeTab} found</h3>
            <p>No {activeTab} matching "{query}" were found. Try a different search term.</p>
        </div>
    );

    const renderError = () => (
        <div className="results-error">
            <p>Error loading {activeTab}. Please try again.</p>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );

    return (
        <div className="search-page" role="main">
            <div className="search-header">
                <h1 className="search-title">Search Results for "{query}"</h1>
                <p className="search-subtitle">{totalCount} result{totalCount !== 1 ? 's' : ''} found</p>
            </div>

            <nav className="search-tabs" role="tablist" aria-label="Search results tabs">
                <button 
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                    role="tab"
                    aria-selected={activeTab === 'users'}
                    aria-controls="users-panel"
                    tabIndex={activeTab === 'users' ? 0 : -1}
                >
                    Users
                    <span className="tab-count">{usersData?.totalElements ?? 0}</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                    role="tab"
                    aria-selected={activeTab === 'posts'}
                    aria-controls="posts-panel"
                    tabIndex={activeTab === 'posts' ? 0 : -1}
                >
                    Posts
                    <span className="tab-count">{postsData?.totalElements ?? 0}</span>
                </button>
            </nav>

            <div className="search-results" id={activeTab === 'users' ? 'users-panel' : 'posts-panel'}>
                {isError ? renderError() : 
                 isLoading ? renderSkeleton() : 
                 resultsContent.length === 0 ? renderEmpty() :
                 (
                    <div className="results-list">
                        {activeTab === 'users' ? (
                            resultsContent.map(user => (
                                <UserSearchResultItem key={user.id} user={user} />
                            ))
                        ) : (
                            resultsContent.map(post => (
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