// src/features/auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from './authApiSlice';
import { setCredentials } from './authSlice';
import '../../styles/LoginForm.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrMsg('');

        try {
            const userData = await login({ email, password }).unwrap();
            dispatch(setCredentials({
                user: {
                    id: userData.userId,
                    email: userData.email,
                    role: userData.role
                },
                token: userData.token
            }));
            navigate('/');
        } catch (err) {
            if (!err?.originalStatus) {
                setErrMsg('Không có kết nối đến máy chủ');
            } else if (err.originalStatus === 400 || err.originalStatus === 401) {
                setErrMsg('Sai tài khoản hoặc mật khẩu');
            } else {
                setErrMsg('Đăng nhập thất bại');
            }
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-content-container">

                {/* Logo Section */}
                <div className="login-branding">
                    <h1 className="brand-logo">Social Network</h1>
                    <p className="brand-slogan">
                        Chia sẻ khoảnh khắc, kết nối yêu thương.
                    </p>
                </div>

                {/* Form Section */}
                <div className="login-form-card">
                    <form onSubmit={handleSubmit} className="login-form">
                        {errMsg && <div className="error-message">{errMsg}</div>}

                        <div className="form-group">
                            <input
                                id="login-email"
                                type="text"
                                className="form-input"
                                placeholder="Email hoặc số điện thoại"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <input
                                id="login-password"
                                type="password"
                                className="form-input"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-login" disabled={isLoading}>
                            {isLoading ? 'Đang vào...' : 'Đăng nhập'}
                        </button>

                        <div className="form-footer">
                            <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
                        </div>

                        <div className="divider"></div>

                        <div className="create-account-wrapper">
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="btn-create-new"
                            >
                                Tạo tài khoản mới
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;