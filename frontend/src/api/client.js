import axios from "axios";
import { notifyDataChanged } from "../utils/dataRefresh";

const LOCAL_API_BASE_URL = "http://localhost:5000/api";
const PRODUCTION_API_BASE_URL = "https://medmaxpub.onrender.com/api";

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalRuntime() {
  if (typeof window === "undefined") {
    return import.meta.env.DEV;
  }

  return isLocalHostname(window.location.hostname);
}

export function shouldUseDevelopmentFallback() {
  return isLocalRuntime();
}

function normalizeApiBaseUrl(url) {
  const normalizedUrl = url.replace(/\/+$/, "");
  return normalizedUrl.endsWith("/api") ? normalizedUrl : `${normalizedUrl}/api`;
}

function isLocalApiUrl(url) {
  try {
    return isLocalHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

function buildApiBaseUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").trim();
  const localRuntime = isLocalRuntime();

  if (!configuredBaseUrl) {
    return localRuntime ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL;
  }

  const normalizedConfiguredUrl = normalizeApiBaseUrl(configuredBaseUrl);

  if (localRuntime && !isLocalApiUrl(normalizedConfiguredUrl)) {
    return LOCAL_API_BASE_URL;
  }

  if (!localRuntime && isLocalApiUrl(normalizedConfiguredUrl)) {
    return PRODUCTION_API_BASE_URL;
  }

  return normalizedConfiguredUrl;
}

const api = axios.create({
  baseURL: buildApiBaseUrl()
});

if (typeof window !== "undefined") {
  console.info("[api-client] base-url", {
    runtime: isLocalRuntime() ? "local" : "production",
    baseURL: api.defaults.baseURL
  });
}

function clearAuthState() {
  localStorage.removeItem("medmax-impersonation-original-token");
  localStorage.removeItem("medmax-impersonation-original-user");
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
  (response) => {
    const method = response.config?.method?.toLowerCase();

    if (["post", "put", "patch", "delete"].includes(method || "")) {
      notifyDataChanged({
        method,
        url: response.config?.url || ""
      });
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuthState();
      window.location.href = "/login";
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
