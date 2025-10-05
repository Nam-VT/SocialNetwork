
import { apiSlice } from "../../api/apiSlice";

const VITE_COMMENT_SERVICE_URL = import.meta.env.VITE_COMMENT_SERVICE_URL;

export const commentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCommentsByPost: builder.query({
            query: ({ postId, page = 0, size = 10 }) => 
                `${VITE_COMMENT_SERVICE_URL}/comments/post/${postId}?page=${page}&size=${size}`,
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

        // UPDATE: Cập nhật một bình luận
        updateComment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${VITE_COMMENT_SERVICE_URL}/comments/${id}`,
                method: 'PUT',
                body: data,
            }),
            // Sau khi cập nhật, cần làm mới cả danh sách gốc và các danh sách con có thể chứa nó
            invalidatesTags: (result, error, arg) => [
                { type: 'Comment', id: `LIST-${arg.postId}` },
                arg.parentCommentId ? { type: 'Comment', id: `REPLIES-${arg.parentCommentId}` } : '',
            ].filter(Boolean),
        }),

        // DELETE: Xóa một bình luận
        deleteComment: builder.mutation({
            query: (id) => ({
                url: `${VITE_COMMENT_SERVICE_URL}/comments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Comment', id: `LIST-${arg.postId}` },
                arg.parentCommentId ? { type: 'Comment', id: `REPLIES-${arg.parentCommentId}` } : '',
            ].filter(Boolean),
        }),

        toggleCommentLike: builder.mutation({
            query: (commentId) => ({
                url: `${VITE_COMMENT_SERVICE_URL}/comment-likes`,
                method: 'POST',
                body: { commentId } // Giả định body cần { commentId }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Comment', id: `LIST-${arg.postId}` },
                arg.parentCommentId ? { type: 'Comment', id: `REPLIES-${arg.parentCommentId}` } : '',
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