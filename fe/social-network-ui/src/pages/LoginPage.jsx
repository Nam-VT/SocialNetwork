// src/pages/LoginPage.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { selectCurrentToken } from '../features/auth/authSlice';
import LoginForm from '../features/auth/LoginForm';

const LoginPage = () => {
    const token = useSelector(selectCurrentToken);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        if (token) {
            navigate(from, { replace: true });
        }
    }, [token, navigate, from]);

    return <LoginForm />;
};

export default LoginPage;