import axios, { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

// API Base URL (matching authService)
const API_BASE_URL = __DEV__
  ? "http://192.168.1.11:8080/api"
  : "http://10.244.74.33:8080/api";

// Partner-related types
export interface PartnerInfo {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface PartnerStatus {
  currentPartner: PartnerInfo | null;
  outgoingRequest: PartnerInfo | null;
  incomingRequest: PartnerInfo | null;
  hasPartner: boolean;
  hasPendingRequest: boolean;
}

export interface PartnerResponse {
  message: string;
  status: PartnerStatus;
}

interface ErrorResponse {
  message: string;
}

export const partnerService = {
  /**
   * Send partner request by email
   */
  async sendPartnerRequest(partnerEmail: string): Promise<PartnerResponse> {
    try {
      const response = await axios.post<PartnerResponse>(
        `${API_BASE_URL}/partner/request`,
        { partnerEmail }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to send partner request");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  /**
   * Accept incoming partner request
   */
  async acceptPartnerRequest(): Promise<PartnerResponse> {
    try {
      const response = await axios.post<PartnerResponse>(
        `${API_BASE_URL}/partner/accept`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(
          errorData.message || "Failed to accept partner request"
        );
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  /**
   * Reject incoming partner request
   */
  async rejectPartnerRequest(): Promise<PartnerResponse> {
    try {
      const response = await axios.post<PartnerResponse>(
        `${API_BASE_URL}/partner/reject`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(
          errorData.message || "Failed to reject partner request"
        );
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  /**
   * Cancel outgoing partner request
   */
  async cancelPartnerRequest(): Promise<PartnerResponse> {
    try {
      const response = await axios.delete<PartnerResponse>(
        `${API_BASE_URL}/partner/request`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(
          errorData.message || "Failed to cancel partner request"
        );
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  /**
   * Unlink from current partner
   */
  async unlinkPartner(): Promise<PartnerResponse> {
    try {
      const response = await axios.delete<PartnerResponse>(
        `${API_BASE_URL}/partner`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || "Failed to unlink partner");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  /**
   * Get current partner status
   */
  async getPartnerStatus(): Promise<PartnerStatus> {
    try {
      const response = await axios.get<PartnerStatus>(
        `${API_BASE_URL}/partner/status`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(
          errorData.message || "Failed to fetch partner status"
        );
      }
      throw new Error("Network error. Please check your connection.");
    }
  },
};
