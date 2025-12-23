import { apiSlice } from "../../api/apiSlice";
import { websocketService } from "../../service/websocketService";

const VITE_NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL;

export const notificationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Mapping GET /notifications
        getMyNotifications: builder.query({
            query: ({ page = 0, size = 10 }) => 
                `${VITE_NOTIFICATION_SERVICE_URL}/notifications?page=${page}&size=${size}`,
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    currentCache.content.push(...newItems.content);
                }
                currentCache.last = newItems.last;
            },
            forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
            providesTags: [{ type: 'Notification', id: 'LIST' }],
        }),

        // Mapping GET /notifications/unread-count
        getUnreadNotificationsCount: builder.query({
            query: () => `${VITE_NOTIFICATION_SERVICE_URL}/notifications/unread-count`,
            providesTags: ['UnreadCount'],
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
                try {
                    await cacheDataLoaded;
                    const onNotificationReceived = (notification) => {
                        updateCachedData((draft) => {
                            if (draft) draft.count = (draft.count || 0) + 1;
                        });
                        dispatch(
                            notificationApiSlice.util.updateQueryData('getMyNotifications', undefined, (draft) => {
                                if (draft.content) draft.content.unshift(notification);
                            })
                        );
                    };
                    websocketService.subscribeToNotifications(onNotificationReceived);
                    await cacheEntryRemoved;
                } catch (err) { console.error("WS Error:", err); }
            },
        }),

        // Mapping POST /notifications/{id}/read
        markAsRead: builder.mutation({
            query: (id) => ({
                url: `${VITE_NOTIFICATION_SERVICE_URL}/notifications/${id}/read`,
                method: 'POST',
            }),
            invalidatesTags: ['UnreadCount'],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApiSlice.util.updateQueryData('getMyNotifications', undefined, (draft) => {
                        const item = draft.content?.find(n => n.id === id);
                        if (item) item.isRead = true; // Khớp field isRead từ BE
                    })
                );
                try { await queryFulfilled; } catch { patchResult.undo(); }
            },
        }),

        // Mapping POST /notifications/read-all
        markAllNotificationsAsRead: builder.mutation({
            query: () => ({
                url: `${VITE_NOTIFICATION_SERVICE_URL}/notifications/read-all`,
                method: 'POST',
            }),
            invalidatesTags: ['UnreadCount', { type: 'Notification', id: 'LIST' }],
        }),
    }),
});

// Export hooks tự động sinh ra từ endpoints
export const {
    useGetMyNotificationsQuery,
    useGetUnreadNotificationsCountQuery,
    useMarkAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
} = notificationApiSlice;