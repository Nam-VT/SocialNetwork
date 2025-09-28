// src/api/apiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '', 
        // Hàm này sẽ được gọi trước mỗi request để gắn token
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token; // Lấy token từ Redux state
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Post', 'Comment', 'User'], 
    endpoints: (builder) => ({}),
});