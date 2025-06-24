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

export type TarotCardProps = Pick<TarotCard, "name" | "image" | "description" | "reversed"> & {
  delay?: number
  alwaysShowFront?: boolean
  onCardClick?: () => void
}

// Possible statuses of the divination process
export type DivinationStatus =
    | "Started"
    | "Pending"
    | "PaymentAccepted"
    | "FailedIntegrationWithChatGPT"
    | "FinishedWithWrongPaymentStatus"
    | "Finished"

// History related types
export interface DivinationHistoryItem {
  id: string
  date: string // mapped from createdAt
  userId: string
  userInfo: DivinationFormData | null
  status: DivinationStatus
  statusComment: string | null
  tarotCards: TarotCard[]
  reading: string | null
}
