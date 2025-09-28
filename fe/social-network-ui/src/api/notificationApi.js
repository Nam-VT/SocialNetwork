import axios from "axios";

const notificationApiClient = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_SERVICE_URL,
});

notificationApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const getMyNotifications = (page = 0, size = 10) =>
  notificationApiClient.get("/notifications", {
    params: { page, size },
});

export const markNotificationAsRead = (id) =>
  notificationApiClient.post(`/notifications/${id}/read`);