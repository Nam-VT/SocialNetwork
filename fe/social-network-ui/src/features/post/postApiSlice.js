import { apiSlice } from "../../api/apiSlice";

const VITE_POST_SERVICE_URL = import.meta.env.VITE_POST_SERVICE_URL;

export const postApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query({
            query: ({ page = 0, size = 10 }) => `${VITE_POST_SERVICE_URL}/posts?page=${page}&size=${size}`,
            serializeQueryArgs: ({ endpointName }) => {
                return endpointName;
            },
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
            query: ({ userId, page = 0, size = 10 }) => `${VITE_POST_SERVICE_URL}/posts/user/${userId}?page=${page}&size=${size}`,
            providesTags: (result, error, arg) => [{ type: 'Post', id: 'LIST' }],
        }),

        createPost: builder.mutation({
            query: (postData) => ({
                url: `${VITE_POST_SERVICE_URL}/posts`,
                method: 'POST',
                body: postData,
            }),
            invalidatesTags: [{ type: 'Post', id: 'LIST' }, { type: 'Post', id: 'FEED' }],
        }),

        updatePost: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${VITE_POST_SERVICE_URL}/posts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.id }],
        }),

        deletePost: builder.mutation({
            query: (id) => ({
                url: `${VITE_POST_SERVICE_URL}/posts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Post', id },
                { type: 'Post', id: 'LIST' },
            ],
        }),

        hasUserLikedPost: builder.query({
            query: (postId) => `${VITE_POST_SERVICE_URL}/api/posts/${postId}/likes`,
            providesTags: (result, error, postId) => [{ type: 'PostLikeStatus', id: postId }],
        }),

        togglePostLike: builder.mutation({
            query: (postId) => ({
                url: `${VITE_POST_SERVICE_URL}/api/posts/${postId}/likes`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, postId) => [
                { type: 'PostLikeStatus', id: postId },
                { type: 'Post', id: postId },
            ],
        }),

        getFeedPosts: builder.query({
            // Chỉ cần định nghĩa query và providesTags
            query: ({ page = 0, size = 10 }) => `${VITE_POST_SERVICE_URL}/feed?page=${page}&size=${size}`,
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
    useTogglePostLikeMutation, 
} = postApiSlice;