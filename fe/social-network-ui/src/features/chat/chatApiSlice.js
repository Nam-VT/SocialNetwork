import { apiSlice } from "../../api/apiSlice";

const VITE_CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL;

export const chatApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Lấy tất cả các phòng chat của người dùng
        getChatRooms: builder.query({
            query: () => `${VITE_CHAT_SERVICE_URL}/chats`,
            providesTags: (result = []) => [
                { type: 'ChatRoom', id: 'LIST' },
                ...result.map(({ id }) => ({ type: 'ChatRoom', id })),
            ],
        }),

        // GET: Lấy lịch sử tin nhắn của một phòng chat
        getMessageHistory: builder.query({
            query: ({ chatRoomId, page = 0, size = 20 }) => 
                `${VITE_CHAT_SERVICE_URL}/chats/${chatRoomId}/messages?page=${page}&size=${size}`,
            providesTags: (result, error, { chatRoomId }) => [{ type: 'Message', id: chatRoomId }],
        }),
        
        // GET: Tìm các nhóm chat chung với người dùng khác
        findCommonGroupRooms: builder.query({
            query: (otherUserId) => `${VITE_CHAT_SERVICE_URL}/chats/common-groups/${otherUserId}`,
        }),

        // POST: Tìm hoặc tạo một phòng chat riêng 1-1
        findOrCreatePrivateRoom: builder.mutation({
            query: (otherUserId) => ({
                url: `${VITE_CHAT_SERVICE_URL}/chats/private/${otherUserId}`,
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'ChatRoom', id: 'LIST' }],
        }),
        
        // POST: Tạo một phòng chat nhóm
        createGroupChatRoom: builder.mutation({
            query: (chatRoomRequest) => ({ // chatRoomRequest = { name: "...", participantIds: [...] }
                url: `${VITE_CHAT_SERVICE_URL}/chats/group`,
                method: 'POST',
                body: chatRoomRequest,
            }),
            invalidatesTags: [{ type: 'ChatRoom', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetChatRoomsQuery,
    useGetMessageHistoryQuery,
    useFindCommonGroupRoomsQuery, // <-- Hook mới
    useFindOrCreatePrivateRoomMutation,
    useCreateGroupChatRoomMutation, // <-- Hook mới
} = chatApiSlice;