"use client"

import type {DivinationHistoryItem} from "@/types"
import {ArrowLeft, Calendar, Wand2} from "lucide-react"
import TarotCard from "../tarot-card"
import {formatDistanceToNow} from "@/lib/date-utils"

interface Props {
    item: DivinationHistoryItem
    onBack: () => void
}

export default function HistoryDetailView({item, onBack}: Props) {
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="mystical-button flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2"/>
                Back to History
            </button>

            <div className="witch-card bg-black/50 p-6 border border-white/10">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white/70"/>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-xl font-serif">
                            {new Date(item.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </h3>
                        <p className="text-sm opacity-70">{formatDistanceToNow(new Date(item.date))} ago</p>
                    </div>
                </div>

                {item.tarotCards.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                        {item.tarotCards.map((card) => (
                            <TarotCard
                                key={card.name}
                                name={card.name}
                                image={card.image ?? "/icons/default-icon.svg"}
                                description={card.description}
                                reversed={card.reversed}
                                alwaysShowFront
                            />
                        ))}
                    </div>
                )}

                {item.reading && (
                    <div className="bg-black/30 border border-white/10 p-6 mt-6 rounded-sm">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                                <Wand2 className="h-4 w-4 opacity-80"/>
                            </div>
                            <div className="mx-3 h-px w-12 bg-white/20"/>
                            <h2 className="text-xl font-serif">Your Reading</h2>
                        </div>

                        <div className="space-y-4 leading-relaxed">
                            {item.reading.split("\n\n").map((paragraph, index) => (
                                <p key={index} className={`${index === 0 ? "font-serif text-lg" : ""} text-white/90`}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
                {item.status !== "Finished" && item.statusComment && (
                    <div className="mt-6">
                        <p className="text-sm text-white/70 font-light leading-relaxed">
                            {item.statusComment}
                        </p>
                    </div>
                )}

            </div>
        </div>
    )
}
