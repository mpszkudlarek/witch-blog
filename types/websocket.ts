import type { PaymentStatus } from "./api"
import type { DivinationFormData, TarotCard } from "@/types"

// WebSocket message types
export enum WebSocketMessageType {
  // Connection events
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  HEARTBEAT = "HEARTBEAT",

  // Authentication events
  AUTH_REQUEST = "AUTH_REQUEST",
  AUTH_SUCCESS = "AUTH_SUCCESS",
  AUTH_FAILURE = "AUTH_FAILURE",

  // Payment events
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  PAYMENT_UPDATE = "PAYMENT_UPDATE",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILURE = "PAYMENT_FAILURE",

  // Divination events
  DIVINATION_REQUEST = "DIVINATION_REQUEST",
  DIVINATION_UPDATE = "DIVINATION_UPDATE",
  DIVINATION_SUCCESS = "DIVINATION_SUCCESS",
  DIVINATION_FAILURE = "DIVINATION_FAILURE",

  // Error events
  ERROR = "ERROR",
}

// Base WebSocket message interface
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType
  payload: T
  timestamp: number
  id: string // Message ID for tracking
}

// Connection related payloads
export interface ConnectPayload {
  clientId?: string
  version?: string
}

export interface HeartbeatPayload {
  clientId: string
  lastMessageId?: string
}

// Authentication related payloads
export interface AuthRequestPayload {
  token?: string
}

export interface AuthSuccessPayload {
  userId: string
  sessionId: string
  expiresAt: number
}

// Payment related payloads
export interface PaymentRequestPayload {
  blikCode: string
  amount: number
  description: string
  reference?: string
}

export interface PaymentUpdatePayload {
  transactionId: string
  status: PaymentStatus
  message?: string
  progress?: number // 0-100
}

export interface PaymentSuccessPayload {
  transactionId: string
  amount: string
  timestamp: string
  receiptUrl?: string
}

export interface PaymentFailurePayload {
  transactionId?: string
  reason: string
  code: string
  recoverable: boolean
}

// Divination related payloads
export interface DivinationRequestPayload {
  userData: DivinationFormData
  transactionId: string
}

export interface DivinationUpdatePayload {
  transactionId: string
  progress: number // 0-100
  stage: DivinationStage
  message?: string
}

export interface DivinationSuccessPayload {
  transactionId: string
  tarotCards: TarotCard[]
  reading: string
}

export interface DivinationFailurePayload {
  transactionId: string
  reason: string
  code: string
  recoverable: boolean
}

// Error payload
export interface ErrorPayload {
  code: string
  message: string
  originalMessageId?: string
  originalMessageType?: WebSocketMessageType
}

// Divination stages
export enum DivinationStage {
  PREPARING = "PREPARING",
  SHUFFLING_CARDS = "SHUFFLING_CARDS",
  SELECTING_CARDS = "SELECTING_CARDS",
  INTERPRETING_CARDS = "INTERPRETING_CARDS",
  GENERATING_READING = "GENERATING_READING",
  FINALIZING = "FINALIZING",
}

// WebSocket connection status
export enum ConnectionStatus {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  AUTHENTICATING = "AUTHENTICATING",
  AUTHENTICATED = "AUTHENTICATED",
  RECONNECTING = "RECONNECTING",
  ERROR = "ERROR",
}
