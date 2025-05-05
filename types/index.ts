export interface DivinationFormData {
  name: string
  dateOfBirth: string
  favoriteColor: string
  favoriteNumber: string
  relationshipStatus: string
}

// Payment related types
export interface PaymentResult {
  success: boolean
  message: string
  amount?: string
  transactionId?: string
  connectionError?: boolean
}

export interface BlikPaymentParams {
  code: string
  amount: number
  description: string
  reference?: string
}

// Divination related types
export interface TarotCard {
  name: string
  image: string
  description: string
  reversed?: boolean
}

export interface DivinationResult {
  success: boolean
  message?: string
  tarotCards?: TarotCard[]
  reading?: string
  openAIError?: boolean
}

// History related types
export interface DivinationHistoryItem {
  id: string
  date: string
  userData: DivinationFormData
  tarotCards: TarotCard[]
  reading: string
}

// API response types
export interface OpenAIResponse {
  id: string
  choices: {
    text: string
  }[]
}

export interface BlikAPIResponse {
  status: string
  transactionId: string
  message: string
}

// WebSocket related types
export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType
  payload: T
  timestamp: number
}

export enum WebSocketMessageType {
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  PAYMENT_RESPONSE = "PAYMENT_RESPONSE",
  DIVINATION_REQUEST = "DIVINATION_REQUEST",
  DIVINATION_RESPONSE = "DIVINATION_RESPONSE",
  ERROR = "ERROR",
}

export interface WebSocketPaymentRequest {
  blikCode: string
  amount: number
  description: string
  reference?: string
}

export interface WebSocketDivinationRequest {
  userData: DivinationFormData
}

export interface WebSocketErrorPayload {
  code: string
  message: string
}
