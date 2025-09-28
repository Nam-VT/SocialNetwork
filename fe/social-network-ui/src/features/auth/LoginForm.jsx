// src/features/auth/LoginForm.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from './authApiSlice';
import '../../styles/LoginForm.css'; // Import từ folder styles tập trung (điều chỉnh path nếu cần)

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    // Sử dụng hook đã tạo ở bước 3
    // `login` là một hàm để trigger mutation
    // `isLoading` là một boolean cho biết trạng thái loading (RTK Query tự quản lý)
    const [login, { isLoading }] = useLoginMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(''); // Xóa lỗi cũ

        try {
            // Gọi hàm login với credentials
            // .unwrap() sẽ trả về một Promise, resolve với data hoặc reject với error
            const userData = await login({ email, password }).unwrap();
            console.log('Login successful:', userData);
            
            // Dọn dẹp form và chuyển hướng về trang chủ
            setEmail('');
            setPassword('');
            navigate('/');

        } catch (err) {
            console.error('Failed to login:', err);
            // Hiển thị lỗi cho người dùng
            setErrorMsg(err.data?.message || 'Login Failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-inner">
                <div className="login-header">
                    <h2 className="login-title">Sign in to your account</h2>
                    <p className="login-subtitle">Welcome back! Please enter your credentials.</p>
                </div>
                <div className="login-card">
                    <form onSubmit={handleSubmit} className="login-form">
                        {errorMsg && (
                            <div className="error-alert">
                                <div className="error-icon">
                                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="error-message">
                                    <p>{errorMsg}</p>
                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>
                        <div className="form-options">
                            <div className="remember-me">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="checkbox"
                                />
                                <label htmlFor="remember-me" className="checkbox-label">Remember me</label>
                            </div>
                            <div className="forgot-password">
                                <a href="#" className="link">Forgot your password?</a>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="submit-button"
                        >
                            <span className="button-icon">
                                {isLoading && (
                                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                            </span>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="form-footer">
                        <p className="footer-text">
                            Don't have an account?{' '}
                            <a href="#" className="link signup-link" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
                                Sign up here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
