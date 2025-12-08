import { create } from "zustand";
import {
  categoryService,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../services/categoryService";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (request: CreateCategoryRequest) => Promise<void>;
  updateCategory: (id: number, request: UpdateCategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryService.getAllCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch categories";
      set({ isLoading: false, error: errorMessage });
    }
  },

  createCategory: async (request: CreateCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoryService.createCategory(request);
      set((state) => ({
        categories: [...state.categories, newCategory],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create category";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  updateCategory: async (id: number, request: UpdateCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await categoryService.updateCategory(id, request);
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? updatedCategory : cat
        ),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update category";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete category";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
