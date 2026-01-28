import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import authReducer, { logOut } from '../features/auth/authSlice';

// Combine reducers
const appReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
});

// Root reducer to handle global reset
const rootReducer = (state, action) => {
    if (action.type === logOut.type) {
        // Reset state only clearing data, but we might want to keep some specific keys if needed
        // For now, undefined resets all reducers to initial state.
        state = undefined;
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    // Gắn middleware của RTK Query để quản lý việc gọi API, caching...
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true, // Bật công cụ Redux DevTools trên trình duyệt
});