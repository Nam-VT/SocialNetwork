import { useState } from 'react';
import { useGetAllPostsQuery } from './adminApiSlice';
import PostTable from './components/PostTable';

const PostManagement = () => {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');

    const { data: postData, isLoading, isError, refetch } = useGetAllPostsQuery({
        page,
        size: 10,
        search
    });

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearch(e.target.value);
            setPage(0);
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 className="page-title" style={{ margin: 0 }}>Post Management</h1>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="search-input-admin"
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            {isLoading ? (
                <div>Loading posts...</div>
            ) : isError ? (
                <div style={{ color: 'red' }}>Error loading posts. Please try again.</div>
            ) : (
                <>
                    <PostTable posts={postData?.content || []} refetch={refetch} />

                    {/* Pagination */}
                    <div className="pagination">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                        <span>Page {page + 1} of {postData?.totalPages || 1}</span>
                        <button disabled={page >= (postData?.totalPages - 1)} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PostManagement;
