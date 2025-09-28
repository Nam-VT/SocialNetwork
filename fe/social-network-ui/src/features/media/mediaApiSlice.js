import { apiSlice } from "../../api/apiSlice";

const VITE_MEDIA_SERVICE_URL = import.meta.env.VITE_MEDIA_SERVICE_URL;

export const mediaApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Mutation để upload một file
        uploadMedia: builder.mutation({
            // queryFn cho phép chúng ta tùy chỉnh hoàn toàn việc gọi API,
            // rất hữu ích cho các request dạng `multipart/form-data`.
            queryFn: async (file, _queryApi, _extraOptions, baseQuery) => {
                const formData = new FormData();
                formData.append('file', file);
                
                // Sử dụng baseQuery của RTK Query nhưng tùy chỉnh header
                const response = await baseQuery({
                    url: `${VITE_MEDIA_SERVICE_URL}/upload`,
                    method: 'POST',
                    body: formData,
                    // Không cần set 'Content-Type', trình duyệt sẽ tự làm khi có FormData
                });

                // Trả về dữ liệu hoặc lỗi theo định dạng của RTK Query
                return response.data
                    ? { data: response.data }
                    : { error: response.error };
            },
        }),
    }),
});

export const { useUploadMediaMutation } = mediaApiSlice;