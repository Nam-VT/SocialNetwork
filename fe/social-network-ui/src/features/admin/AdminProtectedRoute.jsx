import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

const AdminProtectedRoute = ({ children }) => {
    const user = useSelector(selectCurrentUser);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has ADMIN role (Backend uses ROLE_ADMIN)
    if (user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN') {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151'
            }}>
                <h1>403 Forbidden</h1>
                <p>You do not have permission to access the Admin Dashboard.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        backgroundColor: '#0084ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return children;
};

export default AdminProtectedRoute;
