// src/components/MainLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logOut } from '../features/auth/authSlice';

// Import các component con
import NotificationsDropdown from '../features/notification/NotificationsDropdown';
import SearchInput from '../features/search/SearchInput';
import Modal from '../components/ui/Modal'; 

import '../styles/Navbar.css';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleConfirmLogout = () => {
        dispatch(logOut());
        setShowLogoutConfirm(false);
        navigate('/login', { replace: true });
    };

    return (
        <>
            <nav className="navbar" role="navigation">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        Social Network
                    </Link>

                    {/* Hiển thị SearchInput nếu đã đăng nhập */}
                    {currentUser && (
                        <div className="navbar-center">
                            <SearchInput />
                        </div>
                    )}
                    
                    <div className="navbar-nav">
                        {currentUser && (
                            <>  
                                <NotificationsDropdown />
                                {/* Sửa lỗi idgit thành id */}
                                <Link to={`/profile/${currentUser.id}`} className="nav-link profile-link">
                                    <span className="nav-text">My Profile</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="nav-button logout-button"
                                >
                                    <span className="nav-text">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Modal xác nhận đăng xuất */}
            {showLogoutConfirm && (
                 <Modal title="Confirm Logout" onClose={() => setShowLogoutConfirm(false)}>
                    <p>Are you sure you want to log out?</p>
                    <div className="modal-actions">
                        <button onClick={() => setShowLogoutConfirm(false)} type="button" className="btn-cancel">
                            Cancel
                        </button>
                        <button onClick={handleConfirmLogout} type="button" className="btn-logout">
                            Logout
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
};

const MainLayout = () => {
    return (
        <div className="app-layout">
            <header className="app-header">
                <Navbar />
            </header>
            <main className="main-content">
                {/* Vùng chứa nội dung chính sẽ giãn rộng và căn giữa tại đây */}
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;