import axios from "axios";

const commentApi = axios.create({
  baseURL: import.meta.env.VITE_COMMENT_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

commentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

//LIKE
export const toggleLike = async (commentId) => {
  const res = await commentApi.post(`/comment-likes`);
  return res.data;
}