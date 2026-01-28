import { apiSlice } from '../../api/apiSlice';

const VITE_CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:8080';
const VITE_USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081';

export const chatApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Lấy tất cả các phòng chat của người dùng
        getChatRooms: builder.query({
            query: () => `/chats`,
            providesTags: (result = []) => [
                { type: 'ChatRoom', id: 'LIST' },
                ...result.map(({ id }) => ({ type: 'ChatRoom', id })),
            ],
        }),

        // GET: Lấy lịch sử tin nhắn của một phòng chat
        getMessageHistory: builder.query({
            query: ({ chatRoomId, page = 0, size = 20 }) =>
                `/chats/${chatRoomId}/messages?page=${page}&size=${size}`,

            serializeQueryArgs: ({ queryArgs }) => `history-${queryArgs.chatRoomId}`,
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    currentCache.content.unshift(...newItems.content);
                }

                currentCache.first = newItems.first;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: (result, error, { chatRoomId }) => [{ type: 'Message', id: chatRoomId }],
        }),

        // GET: Tìm các nhóm chat chung với người dùng khác
        findCommonGroupRooms: builder.query({
            query: (otherUserId) => `/chats/common-groups/${otherUserId}`,
        }),

        // POST: Tìm hoặc tạo một phòng chat riêng 1-1
        findOrCreatePrivateRoom: builder.mutation({
            query: (otherUserId) => ({
                url: `/chats/private/${otherUserId}`,
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'ChatRoom', id: 'LIST' }],
        }),

        // POST: Tạo một phòng chat nhóm
        createGroupChatRoom: builder.mutation({
            query: (chatRoomRequest) => ({ // chatRoomRequest = { name: "...", participantIds: [...] }
                url: `/chats/group`,
                method: 'POST',
                body: chatRoomRequest,
            }),
            invalidatesTags: [{ type: 'ChatRoom', id: 'LIST' }],
        }),

        // PUT: Cập nhật tên nhóm
        updateGroupName: builder.mutation({
            query: ({ chatRoomId, name }) => ({
                url: `/api/chats/group/${chatRoomId}/name`,
                method: 'PUT',
                body: { name },
            }),
            invalidatesTags: ['ChatRooms'],
        }),

        // DELETE: Xóa nhóm
        deleteGroup: builder.mutation({
            query: (chatRoomId) => ({
                url: `/chats/group/${chatRoomId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ChatRooms'],
        }),

        // POST: Rời nhóm
        leaveGroup: builder.mutation({
            query: (chatRoomId) => ({
                url: `/chats/group/${chatRoomId}/leave`,
                method: 'POST',
            }),
            invalidatesTags: ['ChatRooms'], // Invalidate list to remove the room
        }),


        // POST: Upload Media (Image/Video)
        uploadMedia: builder.mutation({
            query: (formData) => ({
                url: `/media`,
                method: 'POST',
                body: formData,
            }),
        }),
    }),
});

export const {
    useGetChatRoomsQuery,
    useGetMessageHistoryQuery,
    useFindCommonGroupRoomsQuery,
    useFindOrCreatePrivateRoomMutation,
    useCreateGroupChatRoomMutation,
    useUpdateGroupNameMutation,
    useDeleteGroupMutation,
    useLeaveGroupMutation,
    useUploadMediaMutation,
} = chatApiSlice;