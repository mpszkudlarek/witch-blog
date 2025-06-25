import {DivinationHistoryItem, TarotCard} from "@/types"
import {getCardIconFilename} from "@/lib/tarot-utils"
import type {RawDivinationProcess} from "@/types/raw"

export async function getDivinationHistory(userId: string): Promise<DivinationHistoryItem[]> {
    const url = `http://localhost:8080/orchestrator-service/process/${userId}`
    console.log(`[GET] Fetching divination history for userId: ${userId}`)
    console.log(`→ URL: ${url}`)

    const res = await fetch(url, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
    })

    console.log(`[RESPONSE] Status: ${res.status}`)

    if (!res.ok) {
        const text = await res.text()
        console.error("[ERROR] Failed to fetch history:", text)
        throw new Error("Failed to fetch history")
    }

    const rawData: RawDivinationProcess[] = await res.json()
    console.log("[RESPONSE] Received raw data:", rawData)

    const filteredAndMapped = rawData
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
            paymentState: p.paymentState,
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


    console.log("[RESULT] Processed history items:", filteredAndMapped)

    return filteredAndMapped
}
