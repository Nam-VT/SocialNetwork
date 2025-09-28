import axios from "axios";

const postLikeApiClient = axios.create({
    baseURL: import.meta.env.VITE_POST_SERVICE_URL,
});

postLikeApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

//POST
export const toggleLike = (postId) => postLikeApiClient.post(`api/posts/${postId}/likes`);

//GET
export const hasUserLikedPost = (postId) => postLikeApiClient.get(`api/posts/${postId}/likes`);