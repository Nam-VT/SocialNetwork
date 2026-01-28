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
            query: (commentData) => ({
                url: `${VITE_COMMENT_SERVICE_URL}/comments`,
                method: 'POST',
                body: commentData,
            }),
            invalidatesTags: (result, error, { postId, parentCommentId }) =>
                parentCommentId
                    ? [{ type: 'Comment', id: `REPLIES-${parentCommentId}` }]
                    : [{ type: 'Comment', id: `LIST-${postId}` }, { type: 'Post', id: postId }],

            async onQueryStarted({ postId, parentCommentId, postOwnerId }, { dispatch, queryFulfilled }) {
                // If it's a reply, we might want to update reply count (complex), but user complained about Post Comment Count (0 -> 1)
                // So we focus on root comments updating the Post's commentCount

                if (parentCommentId) return; // Skip for replies for now to avoid complexity, or handle separately

                const patchResults = [];
                // Need to import postApiSlice to patch its cache from here?
                // Circular dependency is possible if we import postApiSlice directly if they are in same file or mutually dependent.
                // Assuming we can import 'apiSlice' and use util.
                // Actually, best practice is to use `apiSlice.util.updateQueryData` if they share the same base apiSlice.
                // Since `commentApiSlice` injects into `apiSlice`, they share the store.

                const updatePostCache = (endpointName, args) => {
                    const patchResult = dispatch(
                        apiSlice.util.updateQueryData(endpointName, args, (draft) => {
                            // Find post and increment comment count
                            const post = draft?.content?.find(p => p.id === postId);
                            if (post) {
                                post.commentCount++;
                            }
                        })
                    );
                    patchResults.push(patchResult);
                };

                // Patch known post lists
                updatePostCache('getPosts', { page: 0, size: 10 });
                updatePostCache('getFeedPosts', { page: 0, size: 10 });

                // Patch profile list if we know the owner
                if (postOwnerId) {
                    // Try patching multiple sizes to ensure we hit the active cache key
                    updatePostCache('getPostsByUserId', { userId: postOwnerId, page: 0, size: 9 });
                    updatePostCache('getPostsByUserId', { userId: postOwnerId, page: 0, size: 10 });
                }

                // Patch detail view
                const patchDetail = dispatch(
                    apiSlice.util.updateQueryData('getPostById', postId, (draft) => {
                        if (draft) {
                            draft.commentCount++;
                        }
                    })
                );
                patchResults.push(patchDetail);

                try {
                    await queryFulfilled;
                } catch {
                    patchResults.forEach(p => p.undo());
                }
            }
        }),

        updateComment: builder.mutation({
            query: ({ id, content }) => ({
                url: `${VITE_COMMENT_SERVICE_URL}/comments/${id}`,
                method: 'PUT',
                body: { content },
            }),
            async onQueryStarted({ id, content, postId, parentCommentId }, { dispatch, queryFulfilled }) {
                const patchResults = [];
                // Update specific comment in 'getCommentsByPost'
                if (!parentCommentId) {
                    const patchResult = dispatch(
                        commentApiSlice.util.updateQueryData('getCommentsByPost', { postId, page: 0, size: 10 }, (draft) => {
                            const comment = draft?.content?.find(c => c.id === id);
                            if (comment) comment.content = content;
                        })
                    );
                    patchResults.push(patchResult);
                } else {
                    // Update reply in 'getCommentReplies'
                    const patchResult = dispatch(
                        commentApiSlice.util.updateQueryData('getCommentReplies', { parentId: parentCommentId, page: 0, size: 5 }, (draft) => {
                            const comment = draft?.content?.find(c => c.id === id);
                            if (comment) comment.content = content;
                        })
                    );
                    patchResults.push(patchResult);
                }
                try {
                    await queryFulfilled;
                } catch {
                    patchResults.forEach(p => p.undo());
                }
            },
            invalidatesTags: (result, error, { postId, parentCommentId }) => [
                { type: 'Comment', id: `LIST-${postId}` },
                parentCommentId ? { type: 'Comment', id: `REPLIES-${parentCommentId}` } : null,
            ].filter(Boolean),
        }),

        deleteComment: builder.mutation({
            query: ({ id }) => ({
                url: `${VITE_COMMENT_SERVICE_URL}/comments/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted({ id, postId, parentCommentId }, { dispatch, queryFulfilled }) {
                const patchResults = [];
                // Optimistically remove from 'getCommentsByPost'
                if (!parentCommentId) {
                    const patchResult = dispatch(
                        commentApiSlice.util.updateQueryData('getCommentsByPost', { postId, page: 0, size: 10 }, (draft) => {
                            if (draft?.content) {
                                draft.content = draft.content.filter(c => c.id !== id);
                            }
                        })
                    );
                    patchResults.push(patchResult);
                } else {
                    // Optimistically remove from 'getCommentReplies'
                    const patchResult = dispatch(
                        commentApiSlice.util.updateQueryData('getCommentReplies', { parentId: parentCommentId, page: 0, size: 5 }, (draft) => {
                            if (draft?.content) {
                                draft.content = draft.content.filter(c => c.id !== id);
                            }
                        })
                    );
                    patchResults.push(patchResult);
                }

                try {
                    await queryFulfilled;
                } catch {
                    patchResults.forEach(p => p.undo());
                }
            },
            invalidatesTags: (result, error, { postId, parentCommentId }) => [
                { type: 'Comment', id: `LIST-${postId}` },
                { type: 'Post', id: postId }, // Để cập nhật commentCount
                parentCommentId ? { type: 'Comment', id: `REPLIES-${parentCommentId}` } : null,
            ].filter(Boolean),
        }),

        toggleCommentLike: builder.mutation({
            query: ({ commentId }) => ({
                url: `${VITE_COMMENT_SERVICE_URL}/comment-likes/${commentId}`,
                method: 'POST',
            }),
            // Optimistic Update for Comment Likes
            async onQueryStarted({ commentId, postId, parentCommentId }, { dispatch, queryFulfilled }) {
                const patchResults = [];

                // Helper to patch comment list
                const updateCommentList = (listId) => {
                    const patchResult = dispatch(
                        commentApiSlice.util.updateQueryData('getCommentsByPost', { postId, page: 0, size: 10 }, (draft) => {
                            // This is tricky because getCommentsByPost arguments might vary (page/size).
                            // We might need to guess standard args or use a more comprehensive approach.
                            // For now, targeting the most common view (first page).
                            const comment = draft?.content?.find(c => c.id === commentId);
                            if (comment) {
                                if (comment.isLiked) {
                                    comment.likeCount--;
                                    comment.isLiked = false;
                                } else {
                                    comment.likeCount++;
                                    comment.isLiked = true;
                                }
                            }
                        })
                    );
                    patchResults.push(patchResult);
                };

                // Helper to patch replies list
                const updateReplyList = (parentId) => {
                    const patchResult = dispatch(
                        commentApiSlice.util.updateQueryData('getCommentReplies', { parentId, page: 0, size: 5 }, (draft) => {
                            const comment = draft?.content?.find(c => c.id === commentId);
                            if (comment) {
                                if (comment.isLiked) {
                                    comment.likeCount--;
                                    comment.isLiked = false;
                                } else {
                                    comment.likeCount++;
                                    comment.isLiked = true;
                                }
                            }
                        })
                    );
                    patchResults.push(patchResult);
                }

                // Execute Updates
                // 1. Try updating main comment list of the post
                // We don't accurately know the page/size used by the UI here without passing it in.
                // A safer bet is that the user is likely viewing page 0.
                if (!parentCommentId) {
                    // Try a few common sizes? Or rely on exact match if we can pass args from component.
                    // The component 'CommentSection' uses default size=10.
                    dispatch(
                        commentApiSlice.util.updateQueryData('getCommentsByPost', { postId, page: 0, size: 10 }, (draft) => {
                            const comment = draft?.content?.find(c => c.id === commentId);
                            if (comment) {
                                comment.isLiked = !comment.isLiked;
                                comment.likeCount += comment.isLiked ? 1 : -1;
                            }
                        })
                    );
                } else {
                    // It's a reply
                    dispatch(
                        commentApiSlice.util.updateQueryData('getCommentReplies', { parentId: parentCommentId, page: 0, size: 5 }, (draft) => {
                            const comment = draft?.content?.find(c => c.id === commentId);
                            if (comment) {
                                comment.isLiked = !comment.isLiked;
                                comment.likeCount += comment.isLiked ? 1 : -1;
                            }
                        })
                    );
                }

                try {
                    await queryFulfilled;
                } catch {
                    patchResults.forEach(p => p.undo());
                }
            },
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