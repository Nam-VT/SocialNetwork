// src/components/MainLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser , logOut } from '../features/auth/authSlice';

// Import các component con
import NotificationsDropdown from '../features/notification/NotificationsDropdown';
import SearchInput from '../features/search/SearchInput'; // <-- KIỂM TRA LẠI ĐƯỜNG DẪN NÀY
import Modal from '../components/ui/Modal'; 

// Thêm import CSS cho navbar (tạo file nếu chưa)
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

                    {/* Chỉ hiển thị các thành phần cần đăng nhập */}
                    {currentUser && (
                        <div className="navbar-center">
                            <SearchInput />
                        </div>
                    )}
                    
                    <div className="navbar-nav">
                        {currentUser  && (
                            <>  
                                <NotificationsDropdown />
                                <Link to={`/profile/${currentUser.idgit}`} className="nav-link profile-link">
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                        <button onClick={() => setShowLogoutConfirm(false)} type="button">
                            Cancel
                        </button>
                        <button onClick={handleConfirmLogout} type="button">
                            Logout
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
};

// --- Component MainLayout ---
const MainLayout = () => {
    return (
        <div className="app-layout">
            <header>
                <Navbar />
            </header>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;