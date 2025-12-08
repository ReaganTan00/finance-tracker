import { create } from "zustand";
import {
  budgetService,
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "../services/budgetService";

interface BudgetState {
  budgets: Budget[];
  partnerBudgets: Budget[];
  isLoading: boolean;
  error: string | null;

  fetchBudgets: () => Promise<void>;
  fetchActiveBudgets: () => Promise<void>;
  createBudget: (request: CreateBudgetRequest) => Promise<void>;
  updateBudget: (id: number, request: UpdateBudgetRequest) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
  fetchPartnerBudgets: () => Promise<void>;
  clearError: () => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  partnerBudgets: [],
  isLoading: false,
  error: null,

  fetchBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await budgetService.getAllBudgets();
      set({ budgets, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch budgets";
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchActiveBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await budgetService.getActiveBudgets();
      set({ budgets, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch active budgets";
      set({ isLoading: false, error: errorMessage });
    }
  },

  createBudget: async (request: CreateBudgetRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newBudget = await budgetService.createBudget(request);
      set((state) => ({
        budgets: [...state.budgets, newBudget],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create budget";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  updateBudget: async (id: number, request: UpdateBudgetRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedBudget = await budgetService.updateBudget(id, request);
      set((state) => ({
        budgets: state.budgets.map((budget) =>
          budget.id === id ? updatedBudget : budget
        ),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update budget";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteBudget: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.deleteBudget(id);
      set((state) => ({
        budgets: state.budgets.filter((budget) => budget.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete budget";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  fetchPartnerBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const partnerBudgets = await budgetService.getPartnerBudgets();
      set({ partnerBudgets, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch partner budgets";
      set({ isLoading: false, error: errorMessage });
    }
  },

  clearError: () => set({ error: null }),
}));
