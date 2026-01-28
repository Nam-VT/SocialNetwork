// src/layout/MainLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logOut } from '../features/auth/authSlice';

// Import Components
import NotificationsDropdown from '../features/notification/NotificationsDropdown';
import SearchInput from '../features/search/SearchInput';
import Modal from '../components/ui/Modal';
import RightSidebar from '../features/friend/RightSidebar';

// CHỈ IMPORT FILE CSS NÀY (Đã chứa toàn bộ style layout)
import '../styles/Navbar.css';

// Import thêm
import { useEffect } from 'react';
import { websocketService } from '../service/websocketService';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);
    const token = useSelector(state => state.auth.token); // Retrieve token
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // KẾT NỐI WEBSOCKET TOÀN CỤC KHI NAV BAR MOUNT (USER ĐÃ LOGIN)
    useEffect(() => {
        if (currentUser && token) {
            console.log("MainLayout: currentUser detected, requesting WebSocket connection...", currentUser.id);
            websocketService.connect(
                token,
                () => console.log("WebSocket Connected globally via MainLayout"),
                (err) => console.error("WebSocket Error:", err)
            );
        } else {
            console.log("MainLayout: No currentUser or token, skipping WebSocket connection.");
        }
        // Cleanup khi logout hoặc unmount thì xử lý trong authSlice hoặc service
    }, [currentUser, token]);

    const handleConfirmLogout = () => {
        dispatch(logOut());
        websocketService.disconnect(); // Ngắt kết nối khi logout
        setShowLogoutConfirm(false);
        navigate('/login', { replace: true });
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">Social Network</Link>

                    {currentUser && (
                        <div className="navbar-center">
                            <SearchInput />
                        </div>
                    )}

                    <div className="navbar-nav">
                        {currentUser && (
                            <>
                                <NotificationsDropdown />
                                <Link to={`/profile/${currentUser.id}`} className="nav-link profile-link">
                                    <span>My Profile</span>
                                </Link>
                                <button type="button" onClick={() => setShowLogoutConfirm(true)} className="nav-button logout-button">
                                    <span>Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {showLogoutConfirm && (
                <Modal title="Confirm Logout" onClose={() => setShowLogoutConfirm(false)}>
                    <p style={{ color: '#333' }}>Are you sure you want to log out?</p>
                    <div className="modal-actions">
                        <button onClick={() => setShowLogoutConfirm(false)} className="btn-cancel">Cancel</button>
                        <button onClick={handleConfirmLogout} className="btn-logout">Logout</button>
                    </div>
                </Modal>
            )}
        </>
    );
};

const MainLayout = () => {
    return (
        <div className="app-layout">
            {/* Header nằm trên cùng */}
            <header className="app-header">
                <Navbar />
            </header>

            {/* Nội dung chính chia 3 cột */}
            <main className="main-content">
                <div className="layout-grid">

                    {/* Cột 1: Sidebar Trái */}
                    <aside className="sidebar-left">
                        <nav className="side-menu">
                            <Link to="/" className="menu-item">
                                <span className="icon">🏠</span>
                                <span className="text">Bảng tin</span>
                            </Link>
                            <Link to="/friend-requests" className="menu-item">
                                <span className="icon">👥</span>
                                <span className="text">Lời mời kết bạn</span>
                            </Link>
                            <Link to="/chat" className="menu-item">
                                <span className="icon">💬</span>
                                <span className="text">Tin nhắn</span>
                            </Link>
                        </nav>
                    </aside>

                    {/* Cột 2: Feed Chính */}
                    <section className="feed-column">
                        <Outlet />
                    </section>

                    {/* Cột 3: Sidebar Phải */}
                    <aside className="sidebar-right">
                        <RightSidebar />
                    </aside>

                </div>
            </main>
        </div>
    );
};

export default MainLayout;