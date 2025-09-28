import axios from 'axios';

const postApiClient = axios.create({
    baseURL: import.meta.env.VITE_POST_SERVICE_URL,
});

postApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

//CREATE
export const createPost = async (postData) => {
    const response = await postApiClient.post('/posts', postData);
    return response.data;
};

// READ
export const getPostById = (id) => postApiClient.get(`/posts/${id}`);
export const getPostOwnerId = (id) => postApiClient.get(`/posts/${id}/owner`);

export const getAllPosts = (page = 0, size = 10) =>
  postApiClient.get("/posts", {
    params: { page, size },
});
export const getPostsByUserId = (userId, page = 0, size = 10) =>
  postApiClient.get(`/posts/user/${userId}`, {
    params: { page, size },
});

// UPDATE
export const updatePost = (id, data) => postApiClient.put(`/posts/${id}`, data);

// DELETE
export const deletePost = (id) => postApiClient.delete(`/posts/${id}`);