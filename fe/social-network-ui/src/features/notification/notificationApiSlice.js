import { apiSlice } from "../../api/apiSlice";
import { websocketService } from "../../service/websocketService";

const VITE_NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL;

export const notificationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Query lấy danh sách thông báo
        getMyNotifications: builder.query({
            query: ({ page = 0, size = 10 }) => 
                `${VITE_NOTIFICATION_SERVICE_URL}/notifications?page=${page}&size=${size}`,
            
            // Chỉ cache 1 danh sách duy nhất cho mọi trang để hỗ trợ Infinite Scroll
            serializeQueryArgs: ({ endpointName }) => endpointName,
            
            // Logic gộp dữ liệu cũ và mới khi tải trang tiếp theo
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    currentCache.content.push(...newItems.content);
                }
                currentCache.last = newItems.last;
                // Giữ lại các trường khác nếu cần
            },
            
            // Buộc tải lại nếu số trang thay đổi
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },

            providesTags: (result) =>
                result && result.content
                    ? [
                          { type: 'Notification', id: 'LIST' },
                          ...result.content.map((n) => ({ type: 'Notification', id: n.id })),
                      ]
                    : [{ type: 'Notification', id: 'LIST' }],

            // --- Tích hợp WebSocket để nhận thông báo Real-time ---
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded; // Chờ query lần đầu xong

                    const onNotificationReceived = (notification) => {
                        updateCachedData((draft) => {
                            // Đẩy thông báo mới nhất vào đầu danh sách
                            if (draft.content) {
                                draft.content.unshift(notification);
                            }
                        });
                    };

                    // Đăng ký nhận thông báo từ WebSocketService
                    websocketService.subscribeToNotifications(onNotificationReceived);

                    await cacheEntryRemoved; // Dọn dẹp khi component unmount
                } catch (err) {
                    console.error("Error in notification WebSocket subscription:", err);
                }
            },
        }),

        // Mutation đánh dấu đã đọc
        markAsRead: builder.mutation({
            query: (id) => ({
                url: `${VITE_NOTIFICATION_SERVICE_URL}/notifications/${id}/read`,
                method: 'POST',
            }),
            // Cập nhật giao diện ngay lập tức (Optimistic Update)
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
                        const notification = draft.content?.find(n => n.id === id);
                        if (notification) {
                            notification.read = true; // Lưu ý: kiểm tra xem backend trả về 'read' hay 'isRead'
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo(); // Hoàn tác nếu lỗi
                }
            },
        }),
        
        markAllNotificationsAsRead: builder.mutation({
            query: () => ({
                url: `${VITE_NOTIFICATION_SERVICE_URL}/notifications/read-all`,
                method: 'POST',
            }),
            invalidatesTags: ['UnreadCount'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApiSlice.util.updateQueryData('getMyNotifications', undefined, (draft) => {
                        draft.content?.forEach(n => n.read = true);
                    })
                );
                try { await queryFulfilled; } catch { patchResult.undo(); }
            },
        }),
    }),
    getUnreadNotificationsCount: builder.query({
        // Đường dẫn phải khớp với @GetMapping("/unread-count") ở BE
        query: () => `${VITE_NOTIFICATION_SERVICE_URL}/notifications/unread-count`,
        
        // Tag này giúp RTK Query biết khi nào cần tự động tải lại số đếm
        providesTags: ['UnreadCount'],
        
        async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
            try {
                await cacheDataLoaded;
                // Lắng nghe WebSocket: Khi có thông báo mới, tăng số đếm lên 1 ngay lập tức
                const onNotificationReceived = (notification) => {
                    updateCachedData((draft) => {
                        if (draft) {
                            draft.count = (draft.count || 0) + 1;
                        }
                    });
                };
                websocketService.subscribeToNotifications(onNotificationReceived);
                await cacheEntryRemoved;
            } catch (err) {}
        },
    }),
});

// Export hooks tự động sinh ra từ endpoints
export const {
    useGetMyNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useGetUnreadNotificationsCountQuery,
} = notificationApiSlice;