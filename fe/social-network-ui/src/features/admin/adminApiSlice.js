import { apiSlice } from "../../api/apiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all users (Admin)
        getAllUsers: builder.query({
            query: ({ page = 0, size = 10, search = '' }) => ({
                url: '/users/search', // Assuming this endpoint exists or similar
                // If specific admin endpoint exists: url: '/admin/users'
                params: { page, size, keyword: search }
            }),
            providesTags: ['AdminUsers']
        }),

        // Get user details
        getUserDetails: builder.query({
            query: (userId) => `/users/${userId}`,
            providesTags: (result, error, arg) => [{ type: 'User', id: arg }]
        }),

        // Ban user
        banUser: builder.mutation({
            query: (userId) => ({
                url: `/users/${userId}/ban`,
                method: 'PUT'
            }),
            invalidatesTags: ['AdminUsers', 'User']
        }),

        // Delete user
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/users/${userId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['AdminUsers']
        }),

        // --- Stats ---
        getAdminUserStats: builder.query({
            query: () => '/users/admin/stats',
            providesTags: ['AdminStats']
        }),
        getAdminPostStats: builder.query({
            query: () => '/posts/admin/stats',
            providesTags: ['AdminStats']
        }),
        getAdminReportStats: builder.query({
            query: () => '/admin/reports/stats',
            providesTags: ['AdminStats']
        }),

        // --- Post Management ---
        getAllPosts: builder.query({
            query: ({ page = 0, size = 10, search = '' }) => ({
                url: '/posts/search', // Using existing search if available, or admin specific
                params: { page, size, content: search }
            }),
            providesTags: ['AdminPosts']
        }),
        deletePost: builder.mutation({
            query: (postId) => ({
                url: `/posts/${postId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['AdminPosts']
        }),
        hidePost: builder.mutation({
            query: ({ id, hidden }) => ({
                url: `/posts/${id}/hide`,
                method: 'PUT',
                body: { hidden }
            }),
            invalidatesTags: ['AdminPosts']
        }),

        // --- Report Management ---
        getAllReports: builder.query({
            query: ({ page = 0, size = 10, status = '' }) => ({
                url: '/admin/reports',
                params: { page, size, status }
            }),
            providesTags: ['AdminReports']
        }),
        resolveReport: builder.mutation({
            query: (reportId) => ({
                url: `/admin/reports/${reportId}/resolve`,
                method: 'PUT'
            }),
            invalidatesTags: ['AdminReports']
        }),
        rejectReport: builder.mutation({
            query: (reportId) => ({
                url: `/admin/reports/${reportId}/reject`,
                method: 'PUT'
            }),
            invalidatesTags: ['AdminReports']
        }),

        // --- Comment Management ---
        getCommentsByPost: builder.query({
            query: ({ postId, page = 0, size = 10 }) => ({
                url: `/comments/post/${postId}`,
                params: { page, size }
            }),
            providesTags: ['AdminComments']
        }),
        deleteComment: builder.mutation({
            query: (commentId) => ({
                url: `/comments/${commentId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['AdminComments']
        })
    })
});

export const {
    useGetAllUsersQuery,
    useBanUserMutation,
    useDeleteUserMutation,
    useRejectReportMutation,
    useGetUserDetailsQuery,
    useGetAdminUserStatsQuery,
    useGetAdminPostStatsQuery,
    useGetAdminReportStatsQuery,
    // Post Management
    useGetAllPostsQuery,
    useDeletePostMutation,
    useHidePostMutation,
    // Report Management
    useGetAllReportsQuery,
    useResolveReportMutation,
    // Comment Management
    useGetCommentsByPostQuery,
    useDeleteCommentMutation
} = adminApiSlice;
