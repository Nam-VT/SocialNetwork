import { useState } from 'react';
import { useGetAllUsersQuery } from './adminApiSlice';
import UserTable from './components/UserTable';

const UserManagement = () => {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');

    // Sử dụng endpoint search users
    const { data: userData, isLoading, isError, refetch } = useGetAllUsersQuery({
        page,
        size: 10,
        search
    });

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearch(e.target.value);
            setPage(0); // Reset ve trang 1 khi search
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 className="page-title" style={{ margin: 0 }}>User Management</h1>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="search-input-admin"
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            {isLoading ? (
                <div>Loading users...</div>
            ) : isError ? (
                <div style={{ color: 'red' }}>Error loading users. Please try again.</div>
            ) : (
                <>
                    <UserTable users={userData?.content || []} refetch={refetch} />

                    {/* Pagination - Simplified */}
                    <div className="pagination">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                        <span>Page {page + 1} of {userData?.totalPages || 1}</span>
                        <button disabled={page >= (userData?.totalPages - 1)} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserManagement;
