
import React from 'react';
import { useGetAdminUserStatsQuery, useGetAdminPostStatsQuery, useGetAdminReportStatsQuery } from './adminApiSlice';
import '../../styles/admin/AdminLayout.css'; // Reuse existing styles or create new ones

const StatCard = ({ title, value, subValue, isLoading, error }) => (
    <div className="stat-card" style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '200px'
    }}>
        <h3 style={{ fontSize: '14px', color: '#65676b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
        {isLoading ? (
            <div className="skeleton" style={{ height: '36px', width: '100px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}></div>
        ) : error ? (
            <span style={{ color: 'red' }}>Error</span>
        ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#1c1e21' }}>{value}</span>
                {subValue && <span style={{ fontSize: '14px', color: '#42b72a' }}>{subValue}</span>}
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { data: userStats, isLoading: userLoading, isError: userError } = useGetAdminUserStatsQuery();
    const { data: postStats, isLoading: postLoading, isError: postError } = useGetAdminPostStatsQuery();
    const { data: reportStats, isLoading: reportLoading, isError: reportError } = useGetAdminReportStatsQuery();

    return (
        <div className="admin-page">
            <h1 className="page-title" style={{ marginBottom: '24px' }}>Dashboard Overview</h1>

            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <StatCard
                    title="Total Users"
                    value={userStats?.totalUsers || 0}
                    subValue={userStats?.newUsersToday ? `+${userStats.newUsersToday} today` : null}
                    isLoading={userLoading}
                    error={userError}
                />

                <StatCard
                    title="Total Posts"
                    value={postStats?.totalPosts || 0}
                    subValue={postStats?.hiddenPosts ? `${postStats.hiddenPosts} hidden` : null} // Maybe warning color for hidden
                    isLoading={postLoading}
                    error={postError}
                />

                <StatCard
                    title="Pending Reports"
                    value={reportStats?.pendingReports || 0}
                    isLoading={reportLoading}
                    error={reportError}
                />
            </div>

            <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="section" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={() => window.location.href = '/admin/users'} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Manage Users</button>
                        <button onClick={() => window.location.href = '/admin/reports'} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Review Reports</button>
                    </div>
                </div>

                <div className="section" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>System Status</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#42b72a' }}></div>
                        <span>All Systems Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
