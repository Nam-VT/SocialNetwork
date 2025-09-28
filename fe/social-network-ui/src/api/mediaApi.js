import axios from 'axios';

const mediaApi = axios.create({
  baseURL: import.meta.env.VITE_MEDIA_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await mediaApi.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const downloadFile = async (id) => {
  const res = await mediaApiClient.get(`/${id}`, {
    responseType: "blob", // nhận binary
  });

  const blob = new Blob([res.data], { type: res.headers["content-type"] });
  const url = window.URL.createObjectURL(blob);

  // Lấy tên file từ Content-Disposition
  const contentDisposition = res.headers["content-disposition"];
  let filename = "file";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match?.[1]) filename = match[1];
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(url);
};

export const deleteFile = async (id) => {
  const res = await mediaApi.delete(`/${id}`);
  return res.data;
};

export const validateMediaIds = async (mediaIds) => {
  const res = await mediaApiClient.post("/internal/validate-ids", mediaIds);
  return res.data; // Boolean
};

export const checkMediaExists = async (id) => {
  try {
    await mediaApiClient.get(`/internal/exists/${id}`);
    return true;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return false;
    }
    throw err;
  }
};
