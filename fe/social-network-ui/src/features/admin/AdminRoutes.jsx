import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import UserManagement from './UserManagement';
import PostManagement from './PostManagement';
import ReportManagement from './ReportManagement';

import Dashboard from './Dashboard';

// Placeholder components for Phase 1
const Settings = () => <div className="page-title">System Settings</div>;

const AdminRoutes = () => {

    return (
        <AdminLayout>
            <Routes>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="posts" element={<PostManagement />} />
                <Route path="reports" element={<ReportManagement />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </AdminLayout>
    );
};

export default AdminRoutes;
