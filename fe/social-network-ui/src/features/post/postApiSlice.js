import { apiSlice } from "../../api/apiSlice";

const VITE_POST_SERVICE_URL = import.meta.env.VITE_POST_SERVICE_URL;

export const postApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query({
            query: ({ page = 0, size = 10 }) => `${VITE_POST_SERVICE_URL}/posts?page=${page}&size=${size}`,

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
                        { type: 'Post', id: 'LIST' },
                        ...result.content.map((post) => ({ type: 'Post', id: post.id })),
                    ]
                    : [{ type: 'Post', id: 'LIST' }],
        }),

        getPostById: builder.query({
            query: (id) => `${VITE_POST_SERVICE_URL}/posts/${id}`,
            providesTags: (result, error, id) => [{ type: 'Post', id }],
        }),

        getPostsByUserId: builder.query({
            query: ({ userId, page = 0, size = 10 }) =>
                `${VITE_POST_SERVICE_URL}/posts/user/${userId}?page=${page}&size=${size}`,
            serializeQueryArgs: ({ queryArgs }) => `posts-user-${queryArgs.userId}`,
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    const uniqueNewPosts = newItems.content.filter(
                        newItem => !currentCache.content.some(currentItem => currentItem.id === newItem.id)
                    );
                    currentCache.content.push(...uniqueNewPosts);
                }
                currentCache.last = newItems.last;
                currentCache.number = newItems.number;
            },
            providesTags: (result, error, { userId }) => [{ type: 'Post', id: `LIST_USER_${userId}` }],
        }),
        createPost: builder.mutation({
            query: (postData) => ({
                url: `${VITE_POST_SERVICE_URL}/posts`,
                method: 'POST',
                body: postData,
            }),
            invalidatesTags: [{ type: 'Post', id: 'LIST' }, { type: 'Post', id: 'FEED' }],
        }),

        // 3. Update Post
        updatePost: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${VITE_POST_SERVICE_URL}/posts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
        }),

        deletePost: builder.mutation({
            query: (id) => ({
                url: `${VITE_POST_SERVICE_URL}/posts/${id}`, // Reverted /api prefix
                method: 'DELETE',
            }),

            invalidatesTags: (result, error, id) => [
                { type: 'Post', id },
                { type: 'Post', id: 'LIST' },
                { type: 'Post', id: 'FEED' }
            ],
        }),

        togglePostLike: builder.mutation({
            query: ({ id }) => ({
                // Dùng /api/posts theo đúng Controller backend bạn đã cấu hình
                url: `${VITE_POST_SERVICE_URL}/posts/${id}/likes`,
                method: 'POST',
            }),
            // Cập nhật cache ngay khi bấm nút
            async onQueryStarted({ id: postId, userId }, { dispatch, queryFulfilled }) {
                const patchResults = [];

                // Helper to update a specific cache entry (reducerPath, args, updateRecipe)
                const updateCache = (endpointName, args, updateRecipe) => {
                    const patchResult = dispatch(
                        postApiSlice.util.updateQueryData(endpointName, args, updateRecipe)
                    );
                    patchResults.push(patchResult);
                };

                const updatePostInDraft = (draft) => {
                    const post = draft?.content?.find((p) => p.id === postId);
                    if (post) {
                        if (post.isLiked) {
                            post.likeCount--;
                            post.isLiked = false;
                        } else {
                            post.likeCount++;
                            post.isLiked = true;
                        }
                    }
                };

                // 1. Update 'getPosts' (Home/general list)
                updateCache('getPosts', { page: 0, size: 10 }, updatePostInDraft);

                // 2. Update 'getFeedPosts' (The main feed)
                updateCache('getFeedPosts', { page: 0, size: 10 }, updatePostInDraft);

                // 3. Update 'getPostById' (Detail view)
                updateCache('getPostById', postId, (draft) => {
                    if (draft) {
                        if (draft.isLiked) {
                            draft.likeCount--;
                            draft.isLiked = false;
                        } else {
                            draft.likeCount++;
                            draft.isLiked = true;
                        }
                    }
                });

                // 4. Update 'getPostsByUserId' (Profile page)
                if (userId) {
                    // Update the Profile cache (page 0 is best guess)
                    updateCache('getPostsByUserId', { userId, page: 0, size: 9 }, updatePostInDraft);
                }

                try {
                    await queryFulfilled;
                } catch {
                    patchResults.forEach(patch => patch.undo());
                }
            },
        }),



        hasUserLikedPost: builder.query({
            query: (postId) => `${VITE_POST_SERVICE_URL}/posts/${postId}/likes`,
            providesTags: (result, error, postId) => [{ type: 'PostLikeStatus', id: postId }],
        }),

        getFeedPosts: builder.query({
            query: ({ page = 0, size = 10 }) => `${VITE_POST_SERVICE_URL}/posts/feed?page=${page}&size=${size}`,
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    const uniqueNewPosts = newItems.content.filter(
                        newItem => !currentCache.content.some(currentItem => currentItem.id === newItem.id)
                    );
                    currentCache.content.push(...uniqueNewPosts);
                }
                currentCache.last = newItems.last;
                currentCache.number = newItems.number;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: (result) =>
                result && result.content
                    ? [
                        { type: 'Post', id: 'FEED' },
                        ...result.content.map((post) => ({ type: 'Post', id: post.id })),
                    ]
                    : [{ type: 'Post', id: 'FEED' }],
        }),
    }),
});

export const {
    useGetFeedPostsQuery,
    useGetPostsQuery,
    useGetPostByIdQuery,
    useGetPostsByUserIdQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useHasUserLikedPostQuery,
    useTogglePostLikeMutation
} = postApiSlice;

