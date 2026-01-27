import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { supabase } from "./supabase";

// Base URL from environment variable
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Create Axios instance with default config
export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Supabase access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: normalize error shape
apiClient.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{ code?: string; message?: string; details?: unknown }>,
  ) => {
    // Normalize error response
    const normalizedError = {
      code: error.response?.data?.code || error.code || "UNKNOWN_ERROR",
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      details: error.response?.data?.details || null,
      status: error.response?.status,
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
