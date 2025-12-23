import { apiSlice } from "../../api/apiSlice";

const VITE_USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL;

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // --- CÁC ENDPOINT THUỘC USER-CONTROLLER (/users) ---
        getCurrentUserProfile: builder.query({
            query: () => `${VITE_USER_SERVICE_URL}/users/profile`,
            providesTags: [{ type: 'User', id: 'CURRENT_USER' }],
        }),

        getUserById: builder.query({
            query: (id) => `${VITE_USER_SERVICE_URL}/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        getUserByDisplayName: builder.query({
            query: (displayName) => `${VITE_USER_SERVICE_URL}/users/by-display-name/${displayName}`,
            providesTags: (result, error, displayName) => [{ type: 'User', id: result?.id || displayName }],
        }),

        updateUserProfile: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${VITE_USER_SERVICE_URL}/users/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id },
                { type: 'User', id: 'CURRENT_USER' }
            ],
        }),

        // Lấy danh sách bạn bè
        getFriends: builder.query({
            query: ({ userId, page = 0, size = 10 }) => 
                `${VITE_USER_SERVICE_URL}/api/friendships/friends/${userId}?page=${page}&size=${size}`,
            // Tag này giúp tự động làm mới khi Unfriend hoặc Accept Friend
            providesTags: (result, error, { userId }) => [
                { type: 'Friend', id: `LIST-${userId}` },
                { type: 'Friend', id: 'LIST' }
            ],
        }),
        
        getFriendshipStatus: builder.query({
            query: (otherUserId) => `${VITE_USER_SERVICE_URL}/api/friendships/status/${otherUserId}`,
            providesTags: (result, error, otherUserId) => [{ type: 'FriendStatus', id: otherUserId }],
        }),

        sendFriendRequest: builder.mutation({
            query: (addresseeId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/requests/${addresseeId}`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, addresseeId) => [{ type: 'FriendStatus', id: addresseeId }],
        }),

        acceptFriendRequest: builder.mutation({
            query: (requestId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/requests/${requestId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, requestId) => [
                'PendingRequest',
                'FriendStatus',
                { type: 'Friend', id: 'LIST' }
            ],
        }),

        declineOrCancelRequest: builder.mutation({
            query: (requestId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/requests/${requestId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['FriendStatus', 'PendingRequest'],
        }),

        unfriend: builder.mutation({
            query: (friendId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/friends/${friendId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, friendId) => [
                { type: 'FriendStatus', id: friendId },
                { type: 'Friend', id: 'LIST' }
            ],
        }),

        getPendingRequests: builder.query({
            query: ({ page = 0, size = 15 }) => 
                `${VITE_USER_SERVICE_URL}/api/friendships/requests/pending?page=${page}&size=${size}`,
            providesTags: ['PendingRequest'],
        }),
    }),
});

export const {
    useGetCurrentUserProfileQuery,
    useGetUserByIdQuery,
    useGetUserByDisplayNameQuery,
    useLazyGetUserByDisplayNameQuery, 
    useUpdateUserProfileMutation,
    useGetFriendshipStatusQuery,
    useSendFriendRequestMutation,
    useAcceptFriendRequestMutation,
    useDeclineOrCancelRequestMutation,
    useUnfriendMutation,
    useGetFriendsQuery,
    useGetPendingRequestsQuery,
} = userApiSlice;