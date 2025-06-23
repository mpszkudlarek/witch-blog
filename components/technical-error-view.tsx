"use client"

import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"

export default function TechnicalErrorView() {
    const router = useRouter()

    return (
        <div className="text-center p-6 space-y-6">
            <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-red-900 border border-white/20"></div>
                    <div className="absolute inset-2 rounded-full bg-red-800 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-white/70" />
                    </div>
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-serif mb-3 text-white">Astral Disturbance</h3>
                <p className="text-white/80 font-light">
                    The ethereal pathways between realms are obscured.
                    A technical disruption has sealed the channel. This may be due to server misalignment or cosmic interference.
                </p>
            </div>
            <button onClick={() => router.push("/")} className="mystical-button">
                Return to Portal
            </button>
        </div>
    )
}
