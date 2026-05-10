import axios from "axios";

function buildApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  return configuredBaseUrl.endsWith("/api")
    ? configuredBaseUrl
    : `${configuredBaseUrl.replace(/\/+$/, "")}/api`;
}

const api = axios.create({
  baseURL: buildApiBaseUrl()
});

function clearAuthState() {
  localStorage.removeItem("medmax-token");
  localStorage.removeItem("medmax-user");
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medmax-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthState();

      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export async function withFallback(request, fallbackValue) {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    return typeof fallbackValue === "function" ? fallbackValue(error) : fallbackValue;
  }
}

export default api;
