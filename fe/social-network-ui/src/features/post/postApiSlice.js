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
            // Thay đổi: Nhận cả userId và page/size
            query: ({ userId, page = 0, size = 10 }) => 
                `${VITE_POST_SERVICE_URL}/posts/user/${userId}?page=${page}&size=${size}`,
            // Thêm logic merge để hỗ trợ infinite scroll
            serializeQueryArgs: ({ queryArgs }) => {
                // Gộp cache theo userId
                return `posts-user-${queryArgs.userId}`;
            },
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

        updatePost: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${VITE_POST_SERVICE_URL}/posts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Post', id: arg.id },
                { type: 'Post', id: 'LIST' },
                { type: 'Post', id: 'FEED' },
                { type: 'Post', id: `LIST_USER_${result?.userId}` }
            ],
        }),

        deletePost: builder.mutation({
            query: (id) => ({
                url: `${VITE_POST_SERVICE_URL}/posts/${id}`,
                method: 'DELETE',
            }),
            // SỬA LẠI: Thêm tag 'FEED'
            invalidatesTags: (result, error, id) => [
                { type: 'Post', id },
                { type: 'Post', id: 'LIST' },
                { type: 'Post', id: 'FEED' } 
            ],
        }),

        togglePostLike: builder.mutation({
            query: (postId) => ({
                url: `${VITE_POST_SERVICE_URL}/api/posts/${postId}/likes`, 
                method: 'POST',
            }),
            invalidatesTags: (result, error, postId) => [
                { type: 'Post', id: postId },
                { type: 'PostLikeStatus', id: postId }
            ],
        }),

        hasUserLikedPost: builder.query({
            query: (postId) => `${VITE_POST_SERVICE_URL}/api/posts/${postId}/likes`,
            providesTags: (result, error, postId) => [{ type: 'PostLikeStatus', id: postId }],
        }),

        getFeedPosts: builder.query({
            query: ({ page = 0, size = 10 }) => `${VITE_POST_SERVICE_URL}/posts/feed?page=${page}&size=${size}`,
            
            // 1. Gộp tất cả các request vào một cache duy nhất
            serializeQueryArgs: ({ endpointName }) => {
                return endpointName;
            },

            // 2. Tự động nối dữ liệu mới vào cache hiện tại
            merge: (currentCache, newItems) => {
                if (currentCache.content && newItems.content) {
                    // Lọc ra các bài viết mới thực sự để tránh trùng lặp
                    const uniqueNewPosts = newItems.content.filter(
                        newItem => !currentCache.content.some(currentItem => currentItem.id === newItem.id)
                    );
                    currentCache.content.push(...uniqueNewPosts);
                }
                // Cập nhật thông tin phân trang
                currentCache.last = newItems.last;
                currentCache.number = newItems.number;
            },

            // 3. Đảm bảo fetch lại khi 'page' thay đổi
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