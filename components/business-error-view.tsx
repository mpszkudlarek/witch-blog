"use client"

import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"

export default function BusinessErrorView() {
    const router = useRouter()

    return (
        <div className="text-center p-6 space-y-6">
            <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-yellow-900 border border-white/20"></div>
                    <div className="absolute inset-2 rounded-full bg-yellow-800 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white/70" />
                    </div>
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-serif mb-3 text-white">An Omen Has Stirred</h3>
                <p className="text-white/80 font-light">
                    The spirits seem displeased with the offering.
                    Your payment or input may not align with cosmic requirements.
                    Please review and try again.
                </p>
            </div>
            <button onClick={() => router.push("/")} className="mystical-button">
                Return to Portal
            </button>
        </div>
    )
}
