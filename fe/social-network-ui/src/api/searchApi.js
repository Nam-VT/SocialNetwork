import axios from 'axios';

const searchApi = axios.create({
  baseURL: import.meta.env.VITE_SEARCH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

searchApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const searchAll = async (q, page = 0, size = 10) => {
  const response = await searchApi.get('/api/search', {
    params: { q, page, size },
  });
  return response.data;
};

const searchUsers = async (q, page = 0, size = 10) => {
  const response = await searchApi.get('/api/search/users', {
    params: { q, page, size },
  });
  return response.data;
};

const searchPosts = async (q, page = 0, size = 10) => {
  const response = await searchApi.get('/api/search/posts', {
    params: { q, page, size },
  });
  return response.data;
};
