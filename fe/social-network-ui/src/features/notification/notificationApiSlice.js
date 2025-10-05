import { apiSlice } from "../../api/apiSlice";

const VITE_NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL;

export const notificationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Query để lấy danh sách thông báo, hỗ trợ "Tải thêm"
        getNotifications: builder.query({
            query: ({ page = 0, size = 10 }) => `${VITE_NOTIFICATION_SERVICE_URL}/notifications?page=${page}&size=${size}`,
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    currentCache.content.push(...newItems.content);
                }
                currentCache.last = newItems.last;
                currentCache.number = newItems.number;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg !== previousArg;
            },
            providesTags: (result) =>
                result && result.content
                    ? [
                          { type: 'Notification', id: 'LIST' },
                          ...result.content.map((n) => ({ type: 'Notification', id: n.id })),
                      ]
                    : [{ type: 'Notification', id: 'LIST' }],
        }),

        // Mutation để đánh dấu một thông báo là đã đọc
        markAsRead: builder.mutation({
            query: (notificationId) => ({
                url: `${VITE_NOTIFICATION_SERVICE_URL}/notifications/${notificationId}/read`,
                method: 'POST',
            }),
            // Cập nhật cache một cách "lạc quan" mà không cần refetch
            onQueryStarted: async (notificationId, { dispatch, queryFulfilled }) => {
                // `updateQueryData` là một thunk cho phép chúng ta sửa đổi cache
                const patchResult = dispatch(
                    notificationApiSlice.util.updateQueryData(
                        'getNotifications', // Tên query cần cập nhật
                        { page: 0, size: 10 }, // Tham số của query đó
                        (draft) => { // `draft` là một bản nháp của cache (dùng Immer.js)
                            const notification = draft.content.find(n => n.id === notificationId);
                            if (notification) {
                                notification.isRead = true;
                            }
                        }
                    )
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo(); // Nếu API lỗi, hoàn tác lại thay đổi trên cache
                }
            },
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
} = notificationApiSlice;