import { apiSlice } from "../../api/apiSlice";
import { websocketService } from "../../service/websocketService";

const VITE_NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL;

export const notificationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMyNotifications: builder.query({
            query: ({ page = 0, size = 10 }) => 
                `${VITE_NOTIFICATION_SERVICE_URL}/notifications?page=${page}&size=${size}`,
            
            // SỬA LẠI: Bổ sung logic infinite scroll
            serializeQueryArgs: ({ endpointName }) => {
                return endpointName; // Chỉ cache 1 danh sách duy nhất
            },
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    currentCache.content.push(...newItems.content); // Nối trang mới vào cuối
                }
                currentCache.last = newItems.last;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: (result) =>
                result ? [{ type: 'Notification', id: 'LIST' }] : [],
        }),

        getUnreadNotificationsCount: builder.query({
            query: () => `${VITE_NOTIFICATION_SERVICE_URL}/notifications/unread-count`,
            providesTags: ['UnreadCount'],
            // SỬA LẠI: Quản lý WebSocket ngay tại đây
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded; // Chờ cho lần fetch đầu tiên hoàn tất

                    const onNotificationReceived = (notification) => {
                        // Cập nhật số lượng chưa đọc
                        updateCachedData((draft) => {
                            draft.count += 1;
                        });

                        // Đẩy thông báo mới vào đầu danh sách `getMyNotifications`
                        dispatch(apiSlice.util.updateQueryData('getMyNotifications', undefined, (draft) => {
                            draft.content.unshift(notification);
                        }));
                    };

                    // Kết nối và subscribe WebSocket
                    websocketService.connect(() => {
                        websocketService.subscribeToNotifications(onNotificationReceived);
                    }, (error) => {
                        console.error("WebSocket connection error in slice:", error);
                    });

                    await cacheEntryRemoved; // Chờ component unmount

                    // Tắt kết nối khi không còn ai dùng query này
                    websocketService.disconnect();

                } catch (err) {
                    console.error("Error in notification WebSocket subscription:", err);
                }
            },
        }),

        markNotificationAsRead: builder.mutation({
            query: (id) => ({
                url: `${VITE_NOTIFICATION_SERVICE_URL}/notifications/${id}/read`,
                method: 'POST',
            }),
            // Cập nhật cache sau khi đánh dấu đã đọc
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Giảm số lượng chưa đọc
                    dispatch(apiSlice.util.updateQueryData('getUnreadNotificationsCount', undefined, (draft) => {
                        draft.count -= 1;
                    }));
                    // Cập nhật trạng thái 'read' trong danh sách
                    dispatch(apiSlice.util.updateQueryData('getMyNotifications', undefined, (draft) => {
                        const notification = draft.content.find(n => n.id === id);
                        if (notification) notification.read = true;
                    }));
                } catch (err) {
                    console.error("Failed to mark as read", err);
                }
            },
        }),

        markAllNotificationsAsRead: builder.mutation({
            query: () => ({
                url: `${VITE_NOTIFICATION_SERVICE_URL}/notifications/read-all`,
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Set số lượng chưa đọc về 0
                    dispatch(apiSlice.util.updateQueryData('getUnreadNotificationsCount', undefined, (draft) => {
                        draft.count = 0;
                    }));
                    // Cập nhật trạng thái 'read' cho tất cả
                    dispatch(apiSlice.util.updateQueryData('getMyNotifications', undefined, (draft) => {
                        draft.content.forEach(n => n.read = true);
                    }));
                } catch (err) {
                    console.error("Failed to mark all as read", err);
                }
            },
        }),
    }),
});

export const {
    useGetMyNotificationsQuery,
    useGetUnreadNotificationsCountQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
} = notificationApiSlice;