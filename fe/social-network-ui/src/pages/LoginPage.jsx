// src/pages/LoginPage.jsx

import LoginForm from '../features/auth/LoginForm';

const LoginPage = () => {
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