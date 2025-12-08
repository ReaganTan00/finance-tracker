import axios from "axios";

const API_BASE_URL = __DEV__
  ? "http://192.168.1.11:8080/api"
  : "http://10.244.74.33:8080/api";

export enum BudgetPeriod {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  CUSTOM = "CUSTOM",
}

export interface Budget {
  id: number;
  categoryId: number;
  categoryName?: string;
  amount: number;
  spent: number;
  remaining: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  userId: number;
  active: boolean;
  expired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  categoryId: number;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetRequest {
  amount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
}

interface ErrorResponse {
  message: string;
}

export const budgetService = {
  async createBudget(request: CreateBudgetRequest): Promise<Budget> {
    try {
      const response = await axios.post<Budget>(
        `${API_BASE_URL}/budgets`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to create budget");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getAllBudgets(): Promise<Budget[]> {
    try {
      const response = await axios.get<Budget[]>(`${API_BASE_URL}/budgets`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch budgets");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getActiveBudgets(): Promise<Budget[]> {
    try {
      const response = await axios.get<Budget[]>(
        `${API_BASE_URL}/budgets/active`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch active budgets");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getBudgetById(id: number): Promise<Budget> {
    try {
      const response = await axios.get<Budget>(
        `${API_BASE_URL}/budgets/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch budget");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getBudgetsByCategory(categoryId: number): Promise<Budget[]> {
    try {
      const response = await axios.get<Budget[]>(
        `${API_BASE_URL}/budgets/category/${categoryId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch budgets");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async updateBudget(
    id: number,
    request: UpdateBudgetRequest
  ): Promise<Budget> {
    try {
      const response = await axios.put<Budget>(
        `${API_BASE_URL}/budgets/${id}`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to update budget");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async deleteBudget(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/budgets/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to delete budget");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  // Partner viewing
  async getPartnerBudgets(): Promise<Budget[]> {
    try {
      const response = await axios.get<Budget[]>(
        `${API_BASE_URL}/partner/budgets`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch partner budgets");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getPartnerActiveBudgets(): Promise<Budget[]> {
    try {
      const response = await axios.get<Budget[]>(
        `${API_BASE_URL}/partner/budgets/active`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(
          errorData.message || "Failed to fetch partner active budgets"
        );
      }
      throw new Error("Network error. Please check your connection.");
    }
  },
};
