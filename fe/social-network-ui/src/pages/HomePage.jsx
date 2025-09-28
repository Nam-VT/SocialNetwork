import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, logOut } from '../features/auth/authSlice';

const HomePage = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logOut());
        navigate('/login');
    };

    return (
        <div>
            <h1>Home Page</h1>
            {user ? (
                <div>
                    <p>Welcome, {user.email}!</p>
                    <p>User ID: {user.id}</p>
                    <p>Role: {user.role}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <p>You are not logged in. <a href="/login">Login here</a>.</p>
            )}
        </div>
    );
};

export default HomePage;