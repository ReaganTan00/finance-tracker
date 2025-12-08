import { create } from "zustand";
import {
  transactionService,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "../services/transactionService";

interface TransactionState {
  transactions: Transaction[];
  partnerTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  createTransaction: (request: CreateTransactionRequest) => Promise<void>;
  updateTransaction: (id: number, request: UpdateTransactionRequest) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  fetchPartnerTransactions: () => Promise<void>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  partnerTransactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionService.getAllTransactions();
      set({ transactions, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch transactions";
      set({ isLoading: false, error: errorMessage });
    }
  },

  createTransaction: async (request: CreateTransactionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionService.createTransaction(request);
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create transaction";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  updateTransaction: async (id: number, request: UpdateTransactionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTransaction = await transactionService.updateTransaction(
        id,
        request
      );
      set((state) => ({
        transactions: state.transactions.map((txn) =>
          txn.id === id ? updatedTransaction : txn
        ),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update transaction";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteTransaction: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((txn) => txn.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete transaction";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  fetchPartnerTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const partnerTransactions =
        await transactionService.getPartnerTransactions();
      set({ partnerTransactions, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch partner transactions";
      set({ isLoading: false, error: errorMessage });
    }
  },

  clearError: () => set({ error: null }),
}));
