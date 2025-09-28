import axios from 'axios';

const userApiClient = axios.create({
    baseURL: import.meta.env.VITE_USER_SERVICE_URL,
});

userApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// CREATE
export const createUserProfile = (data) => userApiClient.post("/users", data);

// READ
export const getUserProfileById = (id) => userApiClient.get(`/users/${id}`);
export const getUserProfileByDisplayName = (displayName) =>
  userApiClient.get(`/users/by-display-name/${displayName}`);

// UPDATE
export const updateUserProfile = (id, data) =>
  userApiClient.put(`/users/${id}`, data);

// DELETE
export const deleteUserProfile = (id) =>
  userApiClient.delete(`/users/${id}`);

// ====== Internal APIs ======
export const checkUserExists = (id) =>
  userApiClient.get(`/users/internal/exists/${id}`);

export const getUsersByIds = (ids) =>
  userApiClient.post("/users/internal/users-by-ids", ids);

export const validateUserIds = (ids) =>
  userApiClient.post("/users/internal/validate-ids", ids);