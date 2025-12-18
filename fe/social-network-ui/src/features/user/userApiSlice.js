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

        updateUserProfile: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${VITE_USER_SERVICE_URL}/users/${id}`, // id lấy từ object truyền vào
                method: 'PUT',
                body: data, // bio, displayName, avatarId, coverId nằm ở đây
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id },
                { type: 'User', id: 'CURRENT_USER' }
            ],
        }),

        getFriendshipStatus: builder.query({
            query: (otherUserId) => `${VITE_USER_SERVICE_URL}/api/friendships/status/${otherUserId}`,
            // Chuẩn hóa tag để mutation có thể invalidate đúng
            providesTags: (result, error, otherUserId) => [{ type: 'FriendStatus', id: otherUserId }],
        }),
        
        sendFriendRequest: builder.mutation({
            query: (addresseeId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/requests/${addresseeId}`,
                method: 'POST',
            }),
            // Khi gửi yêu cầu, phải invalidate chính ID của addresseeId đó
            invalidatesTags: (result, error, addresseeId) => [{ type: 'FriendStatus', id: addresseeId }],
        }),

        acceptFriendRequest: builder.mutation({
            query: (requestId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/requests/${requestId}/accept`,
                method: 'POST',
            }),
            // Invalidate toàn bộ các tag liên quan để UI cập nhật lại trạng thái "Friends"
            invalidatesTags: ['PendingRequest', 'FriendStatus', { type: 'Friend', id: 'LIST' }],
        }),

        declineOrCancelRequest: builder.mutation({
            query: (requestId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/requests/${requestId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PendingRequest', 'FriendStatus'],
        }),

        unfriend: builder.mutation({
            query: (friendId) => ({
                url: `${VITE_USER_SERVICE_URL}/api/friendships/friends/${friendId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Friendship', id }],
        }),

        getFriendsByUserId: builder.query({
            query: ({ userId, page = 0, size = 10 }) => 
                `${VITE_USER_SERVICE_URL}/api/friendships/friends/${userId}?page=${page}&size=${size}`,
            providesTags: ['Friendship'],
        }),

        getPendingRequests: builder.query({
            query: () => `${VITE_USER_SERVICE_URL}/api/friendships/requests/pending`,
            providesTags: ['PendingRequest'],
        }),
    }),
});

export const {
    useGetCurrentUserProfileQuery,
    useGetUserByIdQuery,
    useGetUserByDisplayNameQuery,
    useLazyGetUserByDisplayNameQuery,
    useGetUsersByIdsQuery,
    useCreateUserProfileMutation,
    useUpdateUserProfileMutation, // <-- KIỂM TRA DÒNG NÀY PHẢI CÓ Ở ĐÂY
    useDeleteUserProfileMutation,
    useGetFriendsQuery,
    useGetPendingRequestsQuery,
    useGetFriendshipStatusQuery,
    useSendFriendRequestMutation,
    useAcceptFriendRequestMutation,
    useDeclineOrCancelRequestMutation,
    useUnfriendMutation,
} = userApiSlice;