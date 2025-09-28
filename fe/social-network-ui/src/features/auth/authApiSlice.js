// src/features/auth/authApiSlice.js

import { apiSlice } from '../../api/apiSlice';
import { setCredentials } from './authSlice';

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/login`,
                method: 'POST',
                body: credentials,
            }),
            // Sau khi query thành công, chúng ta dispatch action để lưu token
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Giả sử data trả về có dạng { user: {...}, accessToken: '...' }
                    dispatch(setCredentials(data));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        register: builder.mutation({
            query: (credentials) => ({
                url: `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/register`,
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
    }),
});

// RTK Query tự động tạo ra các hook tương ứng
export const { useLoginMutation, useRegisterMutation } = authApiSlice;