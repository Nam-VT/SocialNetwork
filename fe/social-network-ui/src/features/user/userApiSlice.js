import { apiSlice } from "../../api/apiSlice";

// User service có thể dùng chung URL với Auth service hoặc có URL riêng
const VITE_USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || import.meta.env.VITE_AUTH_SERVICE_URL;

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // READ: getUserProfileById
        getUserById: builder.query({
            query: (id) => `${VITE_USER_SERVICE_URL}/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        // READ: getUserProfileByDisplayName
        getUserByDisplayName: builder.query({
            query: (displayName) => `${VITE_USER_SERVICE_URL}/users/by-display-name/${displayName}`,
            // Cung cấp tag dựa trên displayName
            providesTags: (result, error, displayName) => [{ type: 'User', id: result?.id || displayName }],
        }),
        
        // READ: getUsersByIds (dùng cho internal)
        getUsersByIds: builder.query({
            query: (ids) => ({
                url: `${VITE_USER_SERVICE_URL}/users/internal/users-by-ids`,
                method: 'POST',
                body: { ids }, // Giả định body cần một object chứa mảng ids
            }),
        }),

        // CREATE: createUserProfile
        createUserProfile: builder.mutation({
            query: (profileData) => ({
                url: `${VITE_USER_SERVICE_URL}/users`,
                method: 'POST',
                body: profileData,
            }),
        }),

        // UPDATE: updateUserProfile
        updateUserProfile: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${VITE_USER_SERVICE_URL}/users/${id}`,
                method: 'PUT',
                body: data,
            }),
            // Sau khi update, làm mới cache cho user tương ứng
            invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.id }],
        }),

        // DELETE: deleteUserProfile
        deleteUserProfile: builder.mutation({
            query: (id) => ({
                url: `${VITE_USER_SERVICE_URL}/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'User', id }],
        }),
    }),
});

export const {
    useGetUserByIdQuery,
    useGetUserByDisplayNameQuery,
    useGetUsersByIdsQuery,
    useCreateUserProfileMutation,
    useUpdateUserProfileMutation,
    useDeleteUserProfileMutation,
} = userApiSlice;