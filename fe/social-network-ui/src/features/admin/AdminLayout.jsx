import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logOut } from '../../features/auth/authSlice';
import '../../styles/admin/AdminLayout.css';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);

    console.log("AdminLayout rendering", currentUser);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Link to="/admin" className="admin-logo">
                        <span>🛡️</span> Admin Panel
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/admin" className={`admin-nav-item ${isActive('/admin')}`}>
                        <span>📊</span> Dashboard
                    </Link>
                    <Link to="/admin/users" className={`admin-nav-item ${isActive('/admin/users')}`}>
                        <span>👥</span> Users
                    </Link>
                    <Link to="/admin/posts" className={`admin-nav-item ${isActive('/admin/posts')}`}>
                        <span>📝</span> Posts
                    </Link>
                    {/* <Link to="/admin/reports" className={`admin-nav-item ${isActive('/admin/reports')}`}>
                        <span>🚩</span> Reports
                    </Link>
                    <Link to="/admin/settings" className={`admin-nav-item ${isActive('/admin/settings')}`}>
                        <span>⚙️</span> Settings
                    </Link> */}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={() => dispatch(logOut())} className="admin-nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-search">
                        <input type="text" placeholder="Search..." className="search-input-admin" />
                    </div>
                    <div className="admin-profile">
                        <span style={{ fontWeight: 600 }}>{currentUser?.displayName || 'Admin'}</span>
                        <img
                            src={currentUser?.avatarUrl || "https://ui-avatars.com/api/?name=Admin&background=0084ff&color=fff"}
                            alt="Admin"
                            style={{ width: 40, height: 40, borderRadius: '50%' }}
                        />
                    </div>
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
