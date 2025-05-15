// User input data types
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
  id?: string
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
