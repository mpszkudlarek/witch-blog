export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: string
  }
  timestamp: string
}

// Authentication related types
export interface AuthRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
  refreshToken: string
}

// Divination API types
export interface DivinationRequest {
  userData: DivinationFormData
  transactionId?: string
}

export interface DivinationResponse {
  reading: string
  tarotCards: TarotCard[]
  transactionId: string
}

// Payment API types
export interface PaymentRequest {
  blikCode: string
  amount: number
  description: string
  reference?: string
}

export interface PaymentResponse {
  transactionId: string
  status: PaymentStatus
  amount: string
  timestamp: string
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

// History API types
export interface HistoryRequest {
  userId?: string
  page?: number
  size?: number
}

export interface HistoryResponse {
  items: DivinationHistoryItem[]
  totalItems: number
  totalPages: number
  currentPage: number
}

// Import existing types to avoid duplication
import type { DivinationFormData, TarotCard, DivinationHistoryItem } from "@/types"
