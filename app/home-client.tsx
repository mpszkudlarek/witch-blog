"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DivinationForm from "@/components/divination-form"
import { Moon, Star, BookOpen } from "lucide-react"
import { useEventHandler } from "@/hooks/use-event-handler"
import { PaymentState, DivinationGenerationStatus } from "@/types/events"

export default function HomeClient() {
    const router = useRouter()

    const { processEvent } = useEventHandler({
        onDivinationGeneration: async (event) => {
            if (event.status === DivinationGenerationStatus.SUCCESS) {
                console.log("Divination ready:", event.divination)
            }
        },
        onPaymentCompleted: async (event) => {
            if (event.state === PaymentState.PAYMENT_SUCCEEDED) {
                router.push("/divination")
            }
        },
        onUnknownEvent: async (event) => {
            console.warn("Received unknown event", event)
        },
    })

    useEffect(() => {
        const ws = new WebSocket("backend-ws-url") // Replace with actual WebSocket URL
        ws.onmessage = (msg) => {
            try {
                const raw = JSON.parse(msg.data)
                processEvent(raw)
            } catch (e) {
                console.error("Failed to parse incoming event", e)
            }
        }

        return () => {
            ws.close()
        }
    }, [processEvent])

    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Moon className="h-6 w-6 mr-2 opacity-80" />
                        <h1 className="text-3xl font-serif">The Witch&#39;s Divination</h1>
                        <Star className="h-6 w-6 ml-2 opacity-80" />
                    </div>
                    <div className="w-16 h-1 bg-white/30 mx-auto mb-4"></div>
                    <p className="text-sm opacity-70 italic">Unveil the mysteries that lie beyond the veil</p>
                </div>

                <DivinationForm />

                <div className="mt-6 text-center">
                    <Link
                        href="/history"
                        className="inline-flex items-center text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Your Reading History
                    </Link>
                </div>
            </div>
        </main>
    )
}
