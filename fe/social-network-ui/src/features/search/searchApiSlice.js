import { apiSlice } from "../../api/apiSlice";

const VITE_SEARCH_SERVICE_URL = import.meta.env.VITE_SEARCH_SERVICE_URL;

export const searchApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Tìm kiếm User
        searchUsers: builder.query({
            query: ({ query, page = 0, size = 10 }) => 
                `${VITE_SEARCH_SERVICE_URL}/api/search/users?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
            // Cung cấp tag để có thể refresh kết quả khi cần
            providesTags: (result, error, { query }) => [{ type: 'Search', id: `USERS-${query}` }],
        }),

        // Tìm kiếm Bài viết
        searchPosts: builder.query({
            query: ({ query, page = 0, size = 10 }) =>
                `${VITE_SEARCH_SERVICE_URL}/api/search/posts?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
            providesTags: (result, error, { query }) => [{ type: 'Search', id: `POSTS-${query}` }],
        }),
    }),
});

export const {
    useLazySearchUsersQuery,
    useLazySearchPostsQuery,
} = searchApiSlice;