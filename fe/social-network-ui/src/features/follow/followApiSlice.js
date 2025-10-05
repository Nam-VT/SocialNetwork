import { apiSlice } from "../../api/apiSlice";

const VITE_FOLLOW_SERVICE_URL = import.meta.env.VITE_FOLLOW_SERVICE_URL;

export const relationshipApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Lấy trạng thái follow với một user khác
        getFollowStatus: builder.query({
            query: (targetUserId) => `${VITE_FOLLOW_SERVICE_URL}/follows/status/${targetUserId}`,
            // Response là: { isFollowing: boolean, isFollowedBy: boolean }
            providesTags: (result, error, targetUserId) => [{ type: 'FollowStatus', id: targetUserId }],
        }),

        // POST: Follow một user
        followUser: builder.mutation({
            query: (followingId) => ({
                url: `${VITE_FOLLOW_SERVICE_URL}/follows/${followingId}`,
                method: 'POST',
            }),
            // Sau khi follow thành công, làm mới trạng thái follow với user đó
            invalidatesTags: (result, error, followingId) => [{ type: 'FollowStatus', id: followingId }],
        }),

        // DELETE: Unfollow một user
        unfollowUser: builder.mutation({
            query: (followingId) => ({
                url: `${VITE_FOLLOW_SERVICE_URL}/follows/${followingId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, followingId) => [{ type: 'FollowStatus', id: followingId }],
        }),

        // GET: Lấy danh sách người đang theo dõi (Following)
        getFollowing: builder.query({
            query: ({ userId, page = 0, size = 10 }) => 
                `${VITE_FOLLOW_SERVICE_URL}/follows/${userId}/following?page=${page}&size=${size}`,
        }),
        
        // GET: Lấy danh sách người được theo dõi (Followers)
        getFollowers: builder.query({
            query: ({ userId, page = 0, size = 10 }) => 
                `${VITE_FOLLOW_SERVICE_URL}/follows/${userId}/followers?page=${page}&size=${size}`,
        }),
    }),
});

export const {
    useGetFollowStatusQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useGetFollowingQuery,
    useGetFollowersQuery,
} = relationshipApiSlice;