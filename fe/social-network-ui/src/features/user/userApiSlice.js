import { apiSlice } from "../../api/apiSlice";

const VITE_USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL;

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getCurrentUserProfile: builder.query({
            query: () => `${VITE_USER_SERVICE_URL}/users/profile`,
            providesTags: (result) => [{ type: 'User', id: 'CURRENT_USER' }, { type: 'User', id: result?.id }],
        }),

        getUserById: builder.query({
            query: (id) => `${VITE_USER_SERVICE_URL}/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        // READ: getUserProfileByDisplayName
        getUserByDisplayName: builder.query({
            query: (displayName) => `${VITE_USER_SERVICE_URL}/users/by-display-name/${displayName}`,
            // Cung cấp tag dựa trên displayName
            providesTags: (result, error, displayName) => [{ type: 'User', id: result?.id || displayName }],
        }),
        
        // READ: getUsersByIds (dùng cho internal)
        getUsersByIds: builder.query({
            query: (ids) => ({
                url: `${VITE_USER_SERVICE_URL}/users/internal/users-by-ids`,
                method: 'POST',
                body: { ids }, // Giả định body cần một object chứa mảng ids
            }),
        }),

        // CREATE: createUserProfile
        createUserProfile: builder.mutation({
            query: (profileData) => ({
                url: `${VITE_USER_SERVICE_URL}/users`,
                method: 'POST',
                body: profileData,
            }),
        }),

        // UPDATE: updateUserProfile
        updateUserProfile: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${VITE_USER_SERVICE_URL}/users/${id}`,
                method: 'PUT',
                body: data,
            }),
            // SỬA LẠI: Thêm invalidatesTags cho CURRENT_USER
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id },
                { type: 'User', id: 'CURRENT_USER' }
            ],
        }),

        // DELETE: deleteUserProfile
        deleteUserProfile: builder.mutation({
            query: (id) => ({
                url: `${VITE_USER_SERVICE_URL}/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        getFriends: builder.query({
            query: ({ userId, page = 0, size = 15 }) => 
                `${VITE_USER_SERVICE_URL}/api/friendships/friends/${userId}?page=${page}&size=${size}`,
            providesTags: (result, error, { userId }) => [{ type: 'Friend', id: `LIST-${userId}` }],
        }),
        
        getPendingRequests: builder.query({
            query: ({ page = 0, size = 15 }) => 
                `${VITE_USER_SERVICE_URL}/api/friendships/requests/pending?page=${page}&size=${size}`,
            providesTags: ['PendingRequest'],
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
                { type: 'Friend', id: 'LIST' }, // Làm mới danh sách bạn bè
            ],
        }),

        declineOrCancelRequest: builder.mutation({
            query: (requestId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/requests/${requestId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PendingRequest'],
        }),

        unfriend: builder.mutation({
            query: (friendId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/friends/${friendId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, friendId) => [
                { type: 'Friend', id: 'LIST' },
                { type: 'FriendStatus', id: friendId }
            ],
        }),
    }),
});

export const {
    useGetCurrentUserProfileQuery, // <-- Thêm
    useGetUserByIdQuery,
    useGetUserByDisplayNameQuery,
    useLazyGetUserByDisplayNameQuery,
    useGetUsersByIdsQuery,
    useCreateUserProfileMutation,
    useUpdateUserProfileMutation,
    useDeleteUserProfileMutation,
    useGetFriendsQuery,
    useGetPendingRequestsQuery,
    useGetFriendshipStatusQuery,
    useSendFriendRequestMutation,
    useAcceptFriendRequestMutation,
    useDeclineOrCancelRequestMutation,
    useUnfriendMutation,
} = userApiSlice;