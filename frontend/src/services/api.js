import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (error?.code === "ERR_NETWORK") {
    return "Could not connect to the API. Check that VITE_API_BASE_URL points to your deployed backend and that CORS allows this site.";
  }

  return "Something went wrong. Please try again.";
}

export default api;
