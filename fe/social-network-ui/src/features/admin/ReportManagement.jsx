import { useState } from 'react';
import { useGetAllReportsQuery } from './adminApiSlice';
import ReportTable from './components/ReportTable';

const ReportManagement = () => {
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState(''); // '' (All), 'PENDING', 'RESOLVED'

    const { data: reportData, isLoading, isError, refetch } = useGetAllReportsQuery({
        page,
        size: 10,
        status: statusFilter
    });

    return (
        <div className="admin-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 className="page-title" style={{ margin: 0 }}>Report Management</h1>
                <div className="actions">
                    <select
                        className="search-input-admin"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: 150 }}
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div>Loading reports...</div>
            ) : isError ? (
                <div style={{ color: 'red' }}>Error loading reports. Please try again.</div>
            ) : (
                <>
                    <ReportTable reports={reportData?.content || []} refetch={refetch} />

                    {/* Pagination */}
                    <div className="pagination">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                        <span>Page {page + 1} of {reportData?.totalPages || 1}</span>
                        <button disabled={page >= (reportData?.totalPages - 1)} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportManagement;
