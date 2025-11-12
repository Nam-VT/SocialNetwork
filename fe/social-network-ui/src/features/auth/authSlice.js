// src/features/auth/authSlice.js (Cập Nhật - Thêm selectCurrentToken)
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
    },
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            
            if (token && user && user.id) {
                state.user = user;
                state.token = token;
                
                // FIXED: Save cả user + token (JSON để persist đầy đủ)
                const authData = { token, user };
                localStorage.setItem('auth', JSON.stringify(authData)); // Key 'auth' thay 'token'
                console.log('Saved Full Auth to localStorage:', { email: user.email, token: 'present' }); // Tạm log (xóa sau)
            }
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            
            // FIXED: Clear đầy đủ (xóa key 'auth' cũ + 'token' nếu có)
            localStorage.removeItem('auth');
            localStorage.removeItem('token'); // Backup nếu code cũ còn
            console.log('Logout: Full clear state + localStorage'); // Tạm log (xóa sau)
        },
    },
});

let initialState = {
    user: null,
    token: null,
};

const storedAuth = localStorage.getItem('auth');
if (storedAuth) {
    try {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth.token && parsedAuth.user && parsedAuth.user.id) {
            initialState.user = parsedAuth.user;
            initialState.token = parsedAuth.token;
            console.log('Loaded Full Auth from localStorage:', { email: parsedAuth.user.email, token: 'present' }); // Tạm log
        } else {
            // Invalid data → Clear
            localStorage.removeItem('auth');
            console.warn('Invalid stored auth - Cleared');
        }
    } catch (e) {
        console.error('Parse localStorage error:', e);
        localStorage.removeItem('auth');
    }
}

authSlice.initialState = initialState;

export const { setCredentials, logOut } = authSlice.actions;
export const selectCurrentUser  = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;

export default authSlice.reducer;
