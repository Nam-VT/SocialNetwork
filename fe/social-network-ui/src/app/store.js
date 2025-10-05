import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
    reducer: {
        // Đăng ký reducer của API Slice
        [apiSlice.reducerPath]: apiSlice.reducer,
        // Đăng ký reducer của Auth để quản lý token/user
        auth: authReducer,
    },
    // Gắn middleware của RTK Query để quản lý việc gọi API, caching...
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true, // Bật công cụ Redux DevTools trên trình duyệt
});