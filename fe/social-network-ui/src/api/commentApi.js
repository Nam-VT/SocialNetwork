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

//CREATE
export const createComment = async (data) => {
  const res = await commentApi.post("/comments", data);
  return res.data;
};

//UPDATE
export const updateComment = async (id, data) => {
  const res = await commentApi.put(`/comments/${id}`, data);
  return res.data;
};

//DELETE
export const deleteComment = async (id) => {
  const res = await commentApi.delete(`/comments/${id}`);
  return res.data;
};

//READ
export const getCommentsByPost = async (postId, page = 0, size = 10) => {
  const res = await commentApi.get(`/comments/post/${postId}`,
    { params: { page, size } },
  );
  return res.data;
};

export const getCommentReplies = async (parentId, page = 0, size = 10) => {
  const res = await commentApi.get(`/comments/${parentId}/replies`,
    { params: { page, size } },
  );
  return res.data;
}