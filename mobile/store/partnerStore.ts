import { create } from "zustand";
import {
  partnerService,
  PartnerInfo,
  PartnerStatus,
} from "../services/partnerService";

interface PartnerState {
  // State
  currentPartner: PartnerInfo | null;
  outgoingRequest: PartnerInfo | null;
  incomingRequest: PartnerInfo | null;
  hasPartner: boolean;
  hasPendingRequest: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  sendPartnerRequest: (partnerEmail: string) => Promise<void>;
  acceptPartnerRequest: () => Promise<void>;
  rejectPartnerRequest: () => Promise<void>;
  cancelPartnerRequest: () => Promise<void>;
  unlinkPartner: () => Promise<void>;
  fetchPartnerStatus: () => Promise<void>;
  clearError: () => void;
}

export const usePartnerStore = create<PartnerState>((set) => ({
  // Initial state
  currentPartner: null,
  outgoingRequest: null,
  incomingRequest: null,
  hasPartner: false,
  hasPendingRequest: false,
  isLoading: false,
  error: null,

  // Send partner request
  sendPartnerRequest: async (partnerEmail: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partnerService.sendPartnerRequest(partnerEmail);

      set({
        currentPartner: response.status.currentPartner,
        outgoingRequest: response.status.outgoingRequest,
        incomingRequest: response.status.incomingRequest,
        hasPartner: response.status.hasPartner,
        hasPendingRequest: response.status.hasPendingRequest,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send request";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Accept partner request
  acceptPartnerRequest: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await partnerService.acceptPartnerRequest();

      set({
        currentPartner: response.status.currentPartner,
        outgoingRequest: response.status.outgoingRequest,
        incomingRequest: response.status.incomingRequest,
        hasPartner: response.status.hasPartner,
        hasPendingRequest: response.status.hasPendingRequest,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to accept request";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Reject partner request
  rejectPartnerRequest: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await partnerService.rejectPartnerRequest();

      set({
        currentPartner: response.status.currentPartner,
        outgoingRequest: response.status.outgoingRequest,
        incomingRequest: response.status.incomingRequest,
        hasPartner: response.status.hasPartner,
        hasPendingRequest: response.status.hasPendingRequest,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reject request";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Cancel partner request
  cancelPartnerRequest: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await partnerService.cancelPartnerRequest();

      set({
        currentPartner: response.status.currentPartner,
        outgoingRequest: response.status.outgoingRequest,
        incomingRequest: response.status.incomingRequest,
        hasPartner: response.status.hasPartner,
        hasPendingRequest: response.status.hasPendingRequest,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel request";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Unlink partner
  unlinkPartner: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await partnerService.unlinkPartner();

      set({
        currentPartner: response.status.currentPartner,
        outgoingRequest: response.status.outgoingRequest,
        incomingRequest: response.status.incomingRequest,
        hasPartner: response.status.hasPartner,
        hasPendingRequest: response.status.hasPendingRequest,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to unlink partner";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Fetch partner status
  fetchPartnerStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const status = await partnerService.getPartnerStatus();

      set({
        currentPartner: status.currentPartner,
        outgoingRequest: status.outgoingRequest,
        incomingRequest: status.incomingRequest,
        hasPartner: status.hasPartner,
        hasPendingRequest: status.hasPendingRequest,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch status";
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
