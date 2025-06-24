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
    id: string
    createdAt: string
    divination: string | null
    status: string
    statusComment: string | null
    userId: string
    userInfo: RawUserInfo | null
    tarotCards: RawTarotCard[] | null
}
