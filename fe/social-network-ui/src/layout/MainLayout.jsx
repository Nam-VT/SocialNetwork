import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser , logOut } from '../features/auth/authSlice';
import NotificationsDropdown from '../features/notification/NotificationsDropdown';
import SearchInput from '../features/search/SearchInput';
import Modal from '../components/ui/Modal';
import '../styles/MainLayout.css';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser  = useSelector(selectCurrentUser );

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setIsLoggingOut(true);
        dispatch(logOut());
        setShowLogoutConfirm(false);
        navigate('/login');
        setIsLoggingOut(false);
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <nav className="navbar" role="navigation" aria-label="Main navigation">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo" aria-label="Go to homepage">
                        Social Network
                    </Link>
                    <div className="navbar-nav">
                        {currentUser  && (
                            <>  
                                <SearchInput />
                                <NotificationsDropdown />
                                <Link
                                    to={`/profile/${currentUser .id}`}
                                    className="nav-link profile-link"
                                    title="My Profile"
                                    aria-label="My Profile"
                                >
                                    <span className="nav-icon">
                                        {/* SVG icon */}
                                    </span>
                                    <span className="nav-text">My Profile</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogoutClick}
                                    className="nav-button logout-button"
                                    title="Log out"
                                    aria-label="Log out"
                                    disabled={isLoggingOut}
                                >
                                    <span className="nav-icon">
                                        {/* SVG icon */}
                                    </span>
                                    <span className="nav-text">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <Modal
                isOpen={showLogoutConfirm}
                onClose={handleCancelLogout}
                title="Confirm Logout"
            >
                <p>Are you sure you want to log out?</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button onClick={handleCancelLogout} type="button">
                        Cancel
                    </button>
                    <button onClick={handleConfirmLogout} type="button" disabled={isLoggingOut}>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Navbar;
