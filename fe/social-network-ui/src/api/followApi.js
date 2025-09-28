import axios from 'axios';

const followApi = axios.create({
  baseURL: import.meta.env.VITE_FOLLOW_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

followApi.interceptors.request.use((config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}), error => Promise.reject(error));

//GET
export const getFollowers = async (userId, page = 0, size = 10) => {
    const response = await followApi.get(`/follows/${userId}/followers`, {
        params: { page, size }
    });
    return response.data;
};

export const getFollowing = async (userId, page = 0, size = 10) => {
    const response = await followApi.get(`/follows/${userId}/following`, {
        params: { page, size }
    });
    return response.data;
};

export const getFollowStatus = async (targetUserId) => {
    const response = await followApi.get(`/follows/status/${targetUserId}`);
    return response.data;
};

//POST
export const followUser = async (followingId) => {
    const response = await followApi.post(`/follows/${followingId}`);
    return response.data;
};

//DELETE
export const unfollowUser = async (followingId) => {
    const response = await followApi.delete(`/follows/${followingId}`);
    return response.data;
};