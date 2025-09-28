import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser , logOut } from '../features/auth/authSlice';
import '../../styles/MainLayout.css';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser  = useSelector(selectCurrentUser );

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            dispatch(logOut());
            navigate('/login');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Social Network
                </Link>
                <div className="navbar-nav">
                    {currentUser  && (
                        <>
                            <Link to={`/profile/${currentUser .id}`} className="nav-link profile-link" title="My Profile">
                                <span className="nav-icon">
                                    <svg className="profile-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span className="nav-text">My Profile</span>
                            </Link>
                            <button onClick={handleLogout} className="nav-button logout-button" title="Log out">
                                <span className="nav-icon">
                                    <svg className="logout-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1H3zm10-1a1 1 0 00-1 1v12a1 1 0 001 1h4a1 1 0 001-1V3a1 1 0 00-1-1h-4zM4 4h8v12H4V4z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span className="nav-text">Logout</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;