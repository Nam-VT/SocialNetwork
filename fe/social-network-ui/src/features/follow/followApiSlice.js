import { apiSlice } from "../../api/apiSlice";

const VITE_FOLLOW_SERVICE_URL = import.meta.env.VITE_FOLLOW_SERVICE_URL;

export const followApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Kiểm tra trạng thái follow
        getFollowStatus: builder.query({
            query: (targetId) => `${VITE_FOLLOW_SERVICE_URL}/follows/status/${targetId}`,
            providesTags: (result, error, targetId) => [{ type: 'Follow', id: targetId }],
        }),

        // Thực hiện Follow
        followUser: builder.mutation({
            query: (targetId) => ({
                url: `${VITE_FOLLOW_SERVICE_URL}/follows/${targetId}`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, targetId) => [
                { type: 'Follow', id: targetId },
                { type: 'Follow', id: 'LIST' },
                { type: 'Post', id: 'FEED' }, // Refresh feed to show new posts
            ],
        }),

        // Hủy Follow
        unfollowUser: builder.mutation({
            query: (targetId) => ({
                url: `${VITE_FOLLOW_SERVICE_URL}/follows/${targetId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, targetId) => [
                { type: 'Follow', id: targetId },
                { type: 'Follow', id: 'LIST' },
                { type: 'Post', id: 'FEED' }, // Refresh feed to remove posts
            ],
        }),

        // Lấy danh sách Followers (người theo dõi mình)
        getFollowers: builder.query({
            query: (userId) => `${VITE_FOLLOW_SERVICE_URL}/follows/${userId}/followers`,
            providesTags: [{ type: 'Follow', id: 'LIST' }],
        }),

        // Lấy danh sách Following (người mình đang theo dõi)
        getFollowing: builder.query({
            query: (userId) => `${VITE_FOLLOW_SERVICE_URL}/follows/${userId}/following`,
            providesTags: [{ type: 'Follow', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetFollowStatusQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useGetFollowersQuery,
    useGetFollowingQuery,
} = followApiSlice;