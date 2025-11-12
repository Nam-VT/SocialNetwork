// src/pages/LoginPage.jsx

import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentToken } from '../features/auth/authSlice';
import LoginForm from '../features/auth/LoginForm';

const LoginPage = () => {
    // 1. Đọc token từ Redux store
    const token = useSelector(selectCurrentToken);
    const location = useLocation();

    // 2. Lấy đường dẫn mà người dùng muốn đến trước khi bị chuyển về trang login
    //    Nếu không có, mặc định là trang chủ "/"
    const from = location.state?.from?.pathname || "/";

    // 3. Logic điều hướng: Nếu có token, chuyển hướng ngay lập tức
    if (token) {
        // `replace` để người dùng không thể nhấn "Back" quay lại trang login
        return <Navigate to={from} replace />;
    }

    // 4. Nếu không có token, hiển thị giao diện đăng nhập như bình thường
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Login to Social Network</h2>
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;