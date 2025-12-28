// src/routes/ProtectedRoute.jsx

import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectCurrentToken } from '../features/auth/authSlice';

const ProtectedRoute = () => {
    const token = useSelector(selectCurrentToken);
    const location = useLocation();

    // Sử dụng toán tử 3 ngôi (ternary operator) là cách viết gọn và phổ biến
    return token ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};


export default ProtectedRoute;