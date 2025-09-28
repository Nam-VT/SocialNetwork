// src/features/auth/authSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: localStorage.getItem('token'), // Lấy token từ localStorage khi tải lại trang
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Action này sẽ được gọi khi đăng nhập/đăng ký thành công
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.token = accessToken;
            localStorage.setItem('token', accessToken); // Lưu token vào localStorage
        },
        // Action này sẽ được gọi khi đăng xuất
        logOut: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

// Tạo các "selector" để dễ dàng lấy state trong component
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;