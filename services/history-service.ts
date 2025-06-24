import {DivinationHistoryItem, TarotCard, DivinationFormData} from "@/types"
import {getCardIconFilename} from "@/lib/tarot-utils"
import type {RawDivinationProcess} from "@/types/raw"


export async function getDivinationHistory(userId: string): Promise<DivinationHistoryItem[]> {
    const res = await fetch(`http://localhost:8080/orchestrator-service/process/${userId}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
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
