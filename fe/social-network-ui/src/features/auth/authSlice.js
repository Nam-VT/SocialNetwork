// src/features/auth/authSlice.js (Cập Nhật - Thêm selectCurrentToken)
import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
    try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            const parsedAuth = JSON.parse(storedAuth);
            if (parsedAuth.token && parsedAuth.user && parsedAuth.user.id) {
                console.log('Loaded Auth:', { email: parsedAuth.user.email, role: parsedAuth.user.role });
                return {
                    user: parsedAuth.user,
                    token: parsedAuth.token
                };
            }
        }
    } catch (e) {
        console.error('LocalStorage load error:', e);
    }
    return {
        user: null,
        token: null,
    };
};

const authSlice = createSlice({
    name: 'auth',
    initialState: loadState(),
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;

            if (token && user && user.id) {
                state.user = user;
                state.token = token;

                const authData = { token, user };
                localStorage.setItem('auth', JSON.stringify(authData));
                console.log('Saved Auth:', { email: user.email, role: user.role });
            }
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('auth');
            localStorage.removeItem('token');
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;

export default authSlice.reducer;
