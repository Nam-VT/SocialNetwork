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

        // Lấy danh sách bạn bè của current user (từ authentication)
        getFriends: builder.query({
            query: ({ page = 0, size = 10 } = {}) =>
                `/api/friendships/friends?page=${page}&size=${size}`,
            providesTags: ['Friends'],
        }),

        // Lấy danh sách bạn bè của user cụ thể (by userId)
        getFriendsByUserId: builder.query({
            query: ({ userId, page = 0, size = 10 }) =>
                `/api/friendships/friends/${userId}?page=${page}&size=${size}`,
            providesTags: (result, error, { userId }) => [
                { type: 'Friend', id: `LIST-${userId}` },
                'Friends'
            ],
        }),

        getFriendshipStatus: builder.query({
            query: (otherUserId) => `/api/friendships/status/${otherUserId}`,
            providesTags: (result, error, otherUserId) => [{ type: 'FriendStatus', id: otherUserId }],
        }),

        sendFriendRequest: builder.mutation({
            query: (addresseeId) => ({
                url: `/api/friendships/requests/${addresseeId}`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, addresseeId) => [{ type: 'FriendStatus', id: addresseeId }],
        }),

        acceptFriendRequest: builder.mutation({
            query: (requestId) => ({
                url: `/api/friendships/requests/${requestId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, requestId) => [
                'PendingRequest',
                'FriendStatus',
                'Friends'
            ],
        }),

        declineOrCancelRequest: builder.mutation({
            query: (requestId) => ({
                url: `/api/friendships/requests/${requestId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['FriendStatus', 'PendingRequest'],
        }),

        unfriend: builder.mutation({
            query: (friendId) => ({
                url: `/api/friendships/friends/${friendId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, friendId) => [
                { type: 'FriendStatus', id: friendId },
                'Friends'
            ],
        }),

        getPendingRequests: builder.query({
            query: ({ page = 0, size = 15 } = {}) =>
                `/api/friendships/requests/pending?page=${page}&size=${size}`,
            providesTags: ['PendingRequest'],
        }),
        getFriendSuggestions: builder.query({
            query: (params) => ({
                url: `/api/friendships/suggestions`,
                params: { page: params?.page || 0, size: params?.size || 5 }
            }),
            providesTags: ['Friend'],
        }),
    }),

});

export const {
    useGetCurrentUserProfileQuery,
    useGetUserByIdQuery,
    useGetUserByDisplayNameQuery,
    useLazyGetUserByDisplayNameQuery,
    useUpdateUserProfileMutation,
    useGetFriendsQuery,
    useGetFriendsByUserIdQuery,
    useGetFriendshipStatusQuery,
    useSendFriendRequestMutation,
    useAcceptFriendRequestMutation,
    useDeclineOrCancelRequestMutation,
    useUnfriendMutation,
    useGetPendingRequestsQuery,
    useGetFriendSuggestionsQuery,
} = userApiSlice;