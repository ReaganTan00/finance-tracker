import axios, { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

// Update this to your backend URL
// For Android emulator: use 10.0.2.2 instead of localhost
// For iOS simulator: use localhost
// For physical device: use your computer's IP address (e.g., 192.168.1.100)
const API_BASE_URL = __DEV__
  ? "http://10.0.2.2:8080/api" // Android emulator
  : "http://10.244.74.33:8080/api";

// Storage keys
const TOKEN_KEY = "jwt_token";
const USER_KEY = "user_data";

// Request/Response types
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  name: string;
  email: string;
  partnerId?: number;
  message: string;
}

export interface UserData {
  userId: number;
  name: string;
  email: string;
  partnerId?: number;
}

interface ErrorResponse {
  message: string;
}

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 seconds

// Axios interceptor to add JWT token to requests
axios.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios interceptor to handle 401 errors (token expired)
axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await authService.clearStorage();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Register a new user
   */
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/register`,
        { name, email, password }
      );

      // Save token and user data
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
      await SecureStore.setItemAsync(
        USER_KEY,
        JSON.stringify({
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          partnerId: response.data.partnerId,
        })
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Registration failed");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        { email, password }
      );

      // Save token and user data
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
      await SecureStore.setItemAsync(
        USER_KEY,
        JSON.stringify({
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          partnerId: response.data.partnerId,
        })
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Login failed");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.clearStorage();
  },

  /**
   * Get stored JWT token
   */
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  /**
   * Get stored user data
   */
  async getUserData(): Promise<UserData | null> {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Validate token with backend
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      await axios.get(`${API_BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  /**
   * Clear all stored authentication data
   */
  async clearStorage(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  /**
   * Get current user profile from backend
   */
  async getCurrentUserProfile(): Promise<UserData> {
    try {
      const response = await axios.get<UserData>(`${API_BASE_URL}/users/me`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch profile");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },
};
