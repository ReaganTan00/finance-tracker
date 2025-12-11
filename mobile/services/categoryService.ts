import axios from "axios";

const API_BASE_URL = __DEV__
  ? "http://192.168.1.11:8080/api"
  : "http://10.244.74.33:8080/api";

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  plannedMonthlyBudget: number;
  monthlySpent: number;
  monthlyRemaining: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  plannedMonthlyBudget?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  plannedMonthlyBudget?: number;
}

interface ErrorResponse {
  message: string;
}

export const categoryService = {
  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await axios.post<Category>(
        `${API_BASE_URL}/categories`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to create category");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await axios.get<Category[]>(
        `${API_BASE_URL}/categories`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch categories");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await axios.get<Category>(
        `${API_BASE_URL}/categories/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch category");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async updateCategory(
    id: number,
    request: UpdateCategoryRequest
  ): Promise<Category> {
    try {
      const response = await axios.put<Category>(
        `${API_BASE_URL}/categories/${id}`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to update category");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async deleteCategory(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to delete category");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },
};
