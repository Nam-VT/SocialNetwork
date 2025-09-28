import axios from 'axios';

const chatApi = axios.create({
  baseURL: import.meta.env.VITE_CHAT_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

//GET
export const getMyChatRooms = async () => {
  const res = await chatApi.get('/chats');
  return res.data;
}

export const getMessageHistory = async (chatRoomId, page = 0, size = 20) => {
  const res = await chatApi.get(`/chats/${chatRoomId}/messages`, {
    params: { page, size },
  });
  return res.data;
}

export const findCommonGroupRooms = async (userId) => {
  const res = await chatApi.get(`/chats/common-groups/${userId}`);
  return res.data;
}

//POST
export const findOrCreateChatRoom = async (otherUserId) => {
  const res = await chatApi.post(`/chats/private/${otherUserId}`);
  return res.data;
}

export const createGroupChatRoom = async (request) => {
  const res = await chatApi.post('/chats/group', request);
  return res.data;
}