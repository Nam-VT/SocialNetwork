import { apiSlice } from "../../api/apiSlice";

const VITE_AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL;

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Định nghĩa mutation cho việc đăng nhập.
         * Tương ứng với `POST /auth/login`
         */
        login: builder.mutation({
            query: (credentials) => ({
                url: `${VITE_AUTH_SERVICE_URL}/auth/login`,
                method: 'POST',
                body: credentials, // { email, password }
            }),
        }),

        /**
         * Định nghĩa mutation cho việc đăng ký.
         * Tương ứng với `POST /auth/register`
         */
        register: builder.mutation({
            query: (userData) => ({
                url: `${VITE_AUTH_SERVICE_URL}/auth/register`,
                method: 'POST',
                body: userData,
            }),
        }),
    }),
});

/**
 * RTK Query tự động tạo ra các hooks dựa trên tên endpoints đã định nghĩa.
 * Dòng này "xuất khẩu" các hooks đó ra để các component khác có thể sử dụng.
 * Đây chính là phần quan trọng nhất để sửa lỗi của bạn.
 */
export const {
    useLoginMutation,
    useRegisterMutation,
} = authApiSlice;