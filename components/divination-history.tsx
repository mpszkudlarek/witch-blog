"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getDivinationHistory } from "@/services/history-service"
import { DivinationHistoryItem } from "@/types"
import HistoryListView from "@/components/history/history-list-view"
import HistoryDetailView from "@/components/history/history-detail-view"
import EmptyState from "@/components/history/history-empty-state"
import LoadingState from "@/components/history/history-loading-state"
import { getOrCreateUserId } from "@/lib/utils"

export default function DivinationHistory() {
    const router = useRouter()
    const [history, setHistory] = useState<DivinationHistoryItem[]>([])
    const [selected, setSelected] = useState<DivinationHistoryItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                const userId = getOrCreateUserId()
                const result = await getDivinationHistory(userId)

                const filtered = result.filter((item) => {
                    const hasCards = item.tarotCards?.length > 0
                    return (
                        (item.status === "Finished" && hasCards) ||
                        item.status === "FailedIntegrationWithChatGPT" ||
                        item.status === "FinishedWithWrongPaymentStatus"
                    )
                })

                setHistory(filtered)
            } catch (err) {
                console.error("❌ Failed to load history:", err)
            } finally {
                setIsLoading(false)
            }
        }

        load()
    }, [])

    if (isLoading) return <LoadingState />
    if (!history.length) return <EmptyState />
    if (selected) return <HistoryDetailView item={selected} onBack={() => setSelected(null)} />

    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <button
                    onClick={() => router.push("/")}
                    className="mystical-button flex items-center text-sm px-5 py-2 rounded-full border border-white/10 bg-gradient-to-r from-purple-900/30 to-black/30 hover:bg-black/50 transition-all shadow-sm backdrop-blur-sm"
                >
                    <span className="mr-2"></span>
                    Return to Portal
                </button>
            </div>

            <HistoryListView items={history} onSelect={(item) => setSelected(item)} />
        </div>
    )
}
