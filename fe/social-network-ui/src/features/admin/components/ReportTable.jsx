import { useNavigate } from 'react-router-dom';
import '../../../styles/admin/Tables.css';
import { useResolveReportMutation, useRejectReportMutation } from '../adminApiSlice';

const ReportTable = ({ reports, refetch }) => {
    const navigate = useNavigate();
    const [resolveReport] = useResolveReportMutation();
    const [rejectReport] = useRejectReportMutation();

    const handleResolve = async (reportId) => {
        if (window.confirm('Mark this report as resolved?')) {
            try {
                await resolveReport(reportId).unwrap();
                alert('Report resolved');
                refetch();
            } catch (err) {
                console.error('Failed to resolve report:', err);
                alert('Failed to resolve report');
            }
        }
    };

    const handleReject = async (reportId) => {
        try {
            await rejectReport(reportId).unwrap();
            refetch();
        } catch (err) {
            console.error('Failed to reject report:', err);
        }
    };

    return (
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Reporter</th>
                        <th>Target</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id}>
                            <td>
                                <div className="user-cell">
                                    <span className="user-name">{report.reporterName}</span>
                                </div>
                            </td>
                            <td>
                                <a
                                    href={report.targetType === 'USER' ? `/profile/${report.targetId}` : `/post/${report.targetId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#0084ff', textDecoration: 'none' }}
                                >
                                    {report.targetType}: {report.targetId.substring(0, 8)}...
                                </a>
                            </td>
                            <td>{report.reason}</td>
                            <td>
                                <span className={`status-badge ${report.status === 'PENDING' ? 'banned' : 'active'}`}
                                    style={report.status === 'PENDING' ? { backgroundColor: '#fef3c7', color: '#d97706' } : {}}>
                                    {report.status}
                                </span>
                            </td>
                            <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button className="action-btn" onClick={() => handleResolve(report.id)}>Resolve</button>
                                <button className="action-btn delete" onClick={() => handleReject(report.id)}>Reject</button>
                            </td>
                        </tr>
                    ))}
                    {reports.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                No reports found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReportTable;
