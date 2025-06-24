"use client"

import type {DivinationHistoryItem} from "@/types"
import {Calendar, Clock, Scroll} from "lucide-react"
import {formatDistanceToNow} from "@/lib/date-utils"
import ReactMarkdown from "react-markdown"
import {useState} from "react"

interface Props {
    items: DivinationHistoryItem[]
    onSelectAction: (item: DivinationHistoryItem) => void
}

type FilterKey = "all" | "success" | "gpt" | "payment"

const filters: { key: FilterKey; label: string }[] = [
    {key: "all", label: "All"},
    {key: "success", label: "Success"},
    {key: "gpt", label: "GPT Error"},
    {key: "payment", label: "Payment Error"},
]

function getStatusLabel(status: string): { label: string; className: string } {
    const base =
        "text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 ring-1 ring-inset tracking-wide shadow-md shadow-black/30 transition-all duration-300"

    switch (status) {
        case "Finished":
            return {
                label: "✨ Success",
                className: `${base} bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white/80 ring-white/10`,
            }
        case "FailedIntegrationWithChatGPT":
            return {
                label: "🧠 GPT Error",
                className: `${base} bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white/80 ring-white/10`,
            }
        case "FinishedWithWrongPaymentStatus":
            return {
                label: "🪙 Payment Error",
                className: `${base} bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white/80 ring-white/10`,
            }
        default:
            return {
                label: "🌫 Unknown",
                className: `${base} bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white/80 ring-white/10`,
            }
    }
}

export default function HistoryListView({items, onSelectAction}: Props) {
    const [statusFilter, setStatusFilter] = useState<FilterKey>("all")
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

    const filteredItems = [...items]
        .filter((item) => {
            if (statusFilter === "success") return item.status === "Finished"
            if (statusFilter === "gpt") return item.status === "FailedIntegrationWithChatGPT"
            if (statusFilter === "payment") return item.status === "FinishedWithWrongPaymentStatus"
            return true
        })
        .sort((a, b) =>
            sortOrder === "desc"
                ? new Date(b.date).getTime() - new Date(a.date).getTime()
                : new Date(a.date).getTime() - new Date(b.date).getTime()
        )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <div className="flex gap-3">
                    {filters.map(({key, label}) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full border backdrop-blur-md shadow-sm transition-all duration-200
                                ${
                                statusFilter === key
                                    ? "bg-white/20 text-white border-white/30 scale-105"
                                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div>
                    <button
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full border border-white/20 text-white/80 hover:brightness-110 hover:scale-105 transition"
                    >
                        Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
                    </button>
                </div>
            </div>

            {filteredItems.map((item) => {
                const {label, className} = getStatusLabel(item.status)

                return (
                    <div
                        key={item.id}
                        className="witch-card bg-black/50 border border-white/10 p-6 rounded-lg hover:bg-black/60 transition cursor-pointer shadow-md"
                        onClick={() => onSelectAction(item)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center mr-3">
                                    <Calendar className="h-5 w-5 text-white/70"/>
                                </div>
                                <div>
                                    <h3 className="text-lg text-white mb-1">
                                        {new Date(item.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </h3>
                                    <div className="flex items-center text-sm text-white/60">
                                        <Clock className="h-3 w-3 mr-1"/>
                                        <span>{formatDistanceToNow(new Date(item.date))} ago</span>
                                    </div>
                                </div>
                            </div>
                            <div className={className}>{label}</div>
                        </div>

                        {item.tarotCards.length > 0 && (
                            <div className="flex gap-3 mt-2 mb-4">
                                {item.tarotCards.slice(0, 3).map((card, index) => (
                                    <div
                                        key={index}
                                        className={`w-8 h-8 p-1 rounded-md border border-white/10 bg-white/5 shadow-sm flex items-center justify-center transition duration-200 ${
                                            card.reversed ? "rotate-180 opacity-70" : "opacity-90"
                                        } hover:opacity-100`}
                                        title={`${card.name} — ${card.description}`}
                                    >
                                        <img
                                            src={card.image}
                                            alt={card.name}
                                            className="w-full h-full object-contain invert"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {item.reading && (
                            <div className="mt-1">
                                <div
                                    className="text-sm text-white/70 font-light leading-relaxed line-clamp-3 prose prose-invert max-w-none prose-p:my-0 prose-p:leading-snug prose-headings:hidden prose-strong:text-white"
                                >
                                    <ReactMarkdown>{item.reading.replace(/\\n/g, "\n")}</ReactMarkdown>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <span
                                        className="text-sm font-serif px-4 py-1.5 bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white/90 rounded-full flex items-center gap-2 border border-white/10 hover:brightness-110 hover:scale-[1.02] transition"
                                    >
                                        <Scroll className="h-4 w-4 opacity-70"/>
                                        View Full Reading
                                    </span>
                                </div>
                            </div>
                        )}

                        {item.status !== "Finished" && item.statusComment && (
                            <p className="text-sm text-white/70 font-light leading-relaxed mt-4">
                                {item.statusComment}
                            </p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
