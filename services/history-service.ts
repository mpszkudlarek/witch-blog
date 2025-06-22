import { DivinationHistoryItem, TarotCard, DivinationFormData } from "@/types"

const iconMap: Record<string, string> = {
    lovers: "lovers-icon.svg",
    justice: "justice-icon.svg",
    wheel: "wheel-icon.svg",
    death: "death-icon.svg",
    devil: "devil-icon.svg",
    moon: "moon-icon.svg",
    star: "star-icon.svg",
    sun: "sun-icon.svg",
    tower: "tower-icon.svg",
}

function getCardIconFilename(cardName: string): string {
    const key = Object.keys(iconMap).find((k) =>
        cardName.toLowerCase().includes(k)
    )
    return key ? `/icons/${iconMap[key]}` : "/icons/default-icon.svg"
}

type RawTarotCard = {
    cardName: string
    description: string
    isReversed: boolean
}

type RawUserInfo = {
    name?: string
    dateOfBirth?: string
    favoriteColor?: string
    relationshipStatus?: string
    favoriteNumber?: string
}

type RawDivinationProcess = {
    id: string
    createdAt: string
    divination: string | null
    status: string
    statusComment: string | null
    userId: string
    userInfo: RawUserInfo | null
    tarotCards: RawTarotCard[] | null
}

export async function getDivinationHistory(userId: string): Promise<DivinationHistoryItem[]> {
    const res = await fetch(`http://localhost:8080/orchestrator-service/process/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
        throw new Error("Failed to fetch history")
    }

    const rawData: RawDivinationProcess[] = await res.json()

    return rawData
        .filter(p =>
            (p.status === "Finished" && (p.tarotCards?.length ?? 0) > 0) ||
            p.status === "FinishedWithWrongPaymentStatus" ||
            p.status === "FailedIntegrationWithChatGPT"
        )
        .map((p): DivinationHistoryItem => ({
            id: p.id,
            date: p.createdAt,
            userId: p.userId,
            status: p.status as DivinationHistoryItem["status"],
            statusComment: p.statusComment,
            userInfo: p.userInfo
                ? {
                    name: p.userInfo.name ?? "",
                    dateOfBirth: p.userInfo.dateOfBirth ?? "",
                    favoriteColor: p.userInfo.favoriteColor ?? "",
                    relationshipStatus: p.userInfo.relationshipStatus ?? "",
                    favoriteNumber: p.userInfo.favoriteNumber ?? "",
                }
                : null,
            tarotCards: (p.tarotCards ?? []).map((card, index): TarotCard => ({
                id: `${p.id}-${index}`,
                name: card.cardName,
                description: card.description,
                reversed: card.isReversed,
                image: getCardIconFilename(card.cardName),
            })),
            reading: p.divination,
        }))
}
