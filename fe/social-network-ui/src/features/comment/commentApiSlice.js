import { apiSlice } from "../../api/apiSlice";

const VITE_COMMENT_SERVICE_URL = import.meta.env.VITE_COMMENT_SERVICE_URL;

export const commentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCommentsByPost: builder.query({
            query: ({ postId, page = 0, size = 10 }) => 
                `${VITE_COMMENT_SERVICE_URL}/comments/post/${postId}?page=${page}&size=${size}`,
            serializeQueryArgs: ({ queryArgs }) => `comments-post-${queryArgs.postId}`,
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    const uniqueNewItems = newItems.content.filter(
                        newItem => !currentCache.content.some(currentItem => currentItem.id === newItem.id)
                    );
                    currentCache.content.push(...uniqueNewItems);
                }
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: (result, error, { postId }) => [{ type: 'Comment', id: `LIST-${postId}` }],
        }),

        getCommentReplies: builder.query({
            query: ({ parentId, page = 0, size = 5 }) => 
                `${VITE_COMMENT_SERVICE_URL}/comments/${parentId}/replies?page=${page}&size=${size}`,
            providesTags: (result, error, { parentId }) => [{ type: 'Comment', id: `REPLIES-${parentId}` }],
        }),
 
        // CREATE: Tạo một bình luận mới (có thể là gốc hoặc trả lời)
        createComment: builder.mutation({
            query: (commentData) => ({ // commentData giờ có thể chứa parentCommentId
                url: `${VITE_COMMENT_SERVICE_URL}/comments`,
                method: 'POST',
                body: commentData,
            }),
            invalidatesTags: (result, error, { postId, parentCommentId }) => 
                parentCommentId 
                    ? [{ type: 'Comment', id: `REPLIES-${parentCommentId}` }]
                    : [{ type: 'Comment', id: `LIST-${postId}` }],
        }),

        updateComment: builder.mutation({
            query: ({ id, content }) => ({
                url: `${VITE_COMMENT_SERVICE_URL}/comments/${id}`,
                method: 'PUT',
                body: { content },
            }),
            invalidatesTags: (result, error, { postId, parentCommentId }) => [
                { type: 'Comment', id: `LIST-${postId}` },
                parentCommentId ? { type: 'Comment', id: `REPLIES-${parentCommentId}` } : null,
            ].filter(Boolean),
        }),

        deleteComment: builder.mutation({
            query: ({ id }) => ({ // SỬA LẠI: Lấy 'id' từ object
                url: `${VITE_COMMENT_SERVICE_URL}/comments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { postId, parentCommentId }) => [
                { type: 'Comment', id: `LIST-${postId}` },
                parentCommentId ? { type: 'Comment', id: `REPLIES-${parentCommentId}` } : null,
            ].filter(Boolean),
        }),

        toggleCommentLike: builder.mutation({
            query: ({ commentId }) => ({ // SỬA LẠI: Lấy 'commentId' từ object
                url: `${VITE_COMMENT_SERVICE_URL}/comment-likes/${commentId}`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, { postId, parentCommentId }) => [
                { type: 'Comment', id: `LIST-${postId}` },
                parentCommentId ? { type: 'Comment', id: `REPLIES-${parentCommentId}` } : null,
            ].filter(Boolean),
        }),
    }),
});

export const {
    useGetCommentsByPostQuery,
    useGetCommentRepliesQuery,
    useCreateCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useToggleCommentLikeMutation,
} = commentApiSlice;