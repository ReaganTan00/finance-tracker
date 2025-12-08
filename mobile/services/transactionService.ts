import axios from "axios";

const API_BASE_URL = __DEV__
  ? "http://192.168.1.11:8080/api"
  : "http://10.244.74.33:8080/api";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface Transaction {
  id: number;
  categoryId: number;
  categoryName?: string;
  budgetId?: number;
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  categoryId: number;
  budgetId?: number;
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: string;
}

export interface UpdateTransactionRequest {
  categoryId?: number;
  budgetId?: number;
  amount?: number;
  type?: TransactionType;
  description?: string;
  transactionDate?: string;
}

interface ErrorResponse {
  message: string;
}

export const transactionService = {
  async createTransaction(
    request: CreateTransactionRequest
  ): Promise<Transaction> {
    try {
      const response = await axios.post<Transaction>(
        `${API_BASE_URL}/transactions`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to create transaction");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const response = await axios.get<Transaction[]>(
        `${API_BASE_URL}/transactions`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getTransactionById(id: number): Promise<Transaction> {
    try {
      const response = await axios.get<Transaction>(
        `${API_BASE_URL}/transactions/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch transaction");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getTransactionsByCategory(categoryId: number): Promise<Transaction[]> {
    try {
      const response = await axios.get<Transaction[]>(
        `${API_BASE_URL}/transactions/category/${categoryId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getTransactionsByBudget(budgetId: number): Promise<Transaction[]> {
    try {
      const response = await axios.get<Transaction[]>(
        `${API_BASE_URL}/transactions/budget/${budgetId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getTransactionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    try {
      const response = await axios.get<Transaction[]>(
        `${API_BASE_URL}/transactions/range`,
        {
          params: { startDate, endDate },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    try {
      const response = await axios.get<Transaction[]>(
        `${API_BASE_URL}/transactions/type/${type}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async updateTransaction(
    id: number,
    request: UpdateTransactionRequest
  ): Promise<Transaction> {
    try {
      const response = await axios.put<Transaction>(
        `${API_BASE_URL}/transactions/${id}`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to update transaction");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  async deleteTransaction(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/transactions/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to delete transaction");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  // Partner viewing
  async getPartnerTransactions(): Promise<Transaction[]> {
    try {
      const response = await axios.get<Transaction[]>(
        `${API_BASE_URL}/partner/transactions`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(
          errorData.message || "Failed to fetch partner transactions"
        );
      }
      throw new Error("Network error. Please check your connection.");
    }
  },
};
