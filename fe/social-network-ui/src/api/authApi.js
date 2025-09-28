import axios from 'axios';

const authApiClient = axios.create({
    baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
});

// Chỉ Client này không cần gửi token (vì đang login/register)

export const loginApi = (params) => authApiClient.post('/auth/login', params);
export const registerApi     = (params) => authApiClient.post('/auth/register', params);