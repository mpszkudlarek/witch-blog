export type RawTarotCard = {
    cardName: string
    description: string
    isReversed: boolean
}

export type RawUserInfo = {
    name?: string
    dateOfBirth?: string
    favoriteColor?: string
    relationshipStatus?: string
    favoriteNumber?: string
}

export type RawDivinationProcess = {
    paymentState: "PAYMENT_FAILED_TECHNICAL_ERROR" | "PAYMENT_FAILED_BUSINESS_ERROR";
    id: string
    createdAt: string
    divination: string | null
    status: string
    statusComment: string | null
    userId: string
    userInfo: RawUserInfo | null
    tarotCards: RawTarotCard[] | null
}
