import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    // Layout này có thể chỉ là một div bao quanh để căn giữa form
    return (
        <div className="auth-container">
            <Outlet />
        </div>
    );
};

export default AuthLayout;