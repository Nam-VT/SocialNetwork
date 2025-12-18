import { apiSlice } from "../../api/apiSlice";

const VITE_SEARCH_SERVICE_URL = import.meta.env.VITE_SEARCH_SERVICE_URL;

export const searchApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        searchUsers: builder.query({
            
            query: ({ query, page = 0, size = 10 }) => 
                `${VITE_SEARCH_SERVICE_URL}/api/search/users?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
            providesTags: (result, error, { query }) => [{ type: 'Search', id: `USERS-${query}` }],
        }),

        searchPosts: builder.query({
            
            query: ({ query, page = 0, size = 10 }) =>
                `${VITE_SEARCH_SERVICE_URL}/api/search/posts?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
            providesTags: (result, error, { query }) => [{ type: 'Search', id: `POSTS-${query}` }],
        }),
    }),
});

export const {
    useLazySearchUsersQuery,
    useLazySearchPostsQuery
    // useSearchUsersQuery,
    // useSearchPostsQuery
} = searchApiSlice;