"use client"

import React, {useState, useEffect, useCallback, useRef} from "react"
import {useRouter, useSearchParams} from "next/navigation"
import {Sparkles} from "lucide-react"

import PaymentAnimation from "./payment-animation"
import TechnicalErrorView from "./technical-error-view"
import BusinessErrorView from "./business-error-view"

import {useStomp} from "@/hooks/useStomp"
import {usePayment} from "@/hooks/use-payment"

import type {
    FrontendEvent,
    DivinationFormData,
    PaymentCompletedEvent,
    IncorrectBLIKCodeEvent,
    ProcessEndedEvent,
    ProcessStartedEvent,
    DivinationRequestedEvent,
    DivinationGenerationEvent,
    BusinessErrorEvent,
    TechnicalErrorEvent,
} from "@/types/events"
import {PaymentState} from "@/types/events"

export default function BlikPaymentForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const userId = searchParams.get("userId") || ""
    const processId = searchParams.get("processId") || ""

    const [divinationData, setDivinationData] = useState<DivinationFormData | null>(null)
    const [blikCode, setBlikCode] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [hasTechnicalError, setHasTechnicalError] = useState(false)
    const [hasBusinessError, setHasBusinessError] = useState(false)
    const [isPaymentError, setIsPaymentError] = useState(false)
    const [error, setError] = useState("")

    const {processPayment, isLoading: isSubmitting, error: paymentError} = usePayment()
    const ignoreEventsRef = useRef(false)

    useEffect(() => {
        const stored = sessionStorage.getItem("divinationData")
        if (stored) {
            try {
                setDivinationData(JSON.parse(stored))
            } catch {
                setError("The astral link was broken. Please begin the ritual anew.")
            }
        }
    }, [])

    const handleStompEvent = useCallback((event: FrontendEvent) => {
        if (ignoreEventsRef.current) return

        const handlers: Record<string, (e: FrontendEvent) => void> = {
            "process.started": (e) => {
                console.log("Process started:", (e as ProcessStartedEvent).processId)
            },
            "payment.completed": (e) => {
                const {state, message} = e as PaymentCompletedEvent
                switch (state) {
                    case PaymentState.PAYMENT_SUCCEEDED:
                        console.log("PAYMENT: Payment succeeded")
                        break
                    case PaymentState.PAYMENT_FAILED_BUSINESS_ERROR:
                        setHasBusinessError(true)
                        setError(message || "The cosmic energies were misaligned.")
                        break
                    case PaymentState.PAYMENT_FAILED_TECHNICAL_ERROR:
                        setHasTechnicalError(true)
                        setError(message || "The arcane channel was severed.")
                        break
                    default:
                        setIsPaymentError(true)
                        setError(message || "The offering failed. Consult the stars and try again.")
                }
            },
            "payment.blik.incorrect": (e) => {
                setIsPaymentError(true)
                setError((e as IncorrectBLIKCodeEvent).message || "The glyphs are false. The spirits reject this code.")
            },
            "divination.requested": (e) => {
                const {cards} = e as DivinationRequestedEvent
                sessionStorage.setItem("divinationCards", JSON.stringify(cards))
                console.log("Cards stored")
            },
            "divination.generation": (e) => {
                const {divination, status} = e as DivinationGenerationEvent
                sessionStorage.setItem("divinationResult", JSON.stringify({divination, status}))
                console.log("🔮 Reading complete")
                ignoreEventsRef.current = true
                router.push("/divination")
            },
            "error.business": (e) => {
                setHasBusinessError(true)
                setError((e as BusinessErrorEvent).message || "A worldly misalignment disrupted the flow of energy.")
            },
            "error.technical": (e) => {
                setHasTechnicalError(true)
                setError((e as TechnicalErrorEvent).message || "The aether trembled. The connection was lost.")
            },
            "process.ended": (e) => {
                const {status, message} = e as ProcessEndedEvent
                if (status === "FinishedWithWrongPaymentStatus") {
                    setHasBusinessError(true)
                    setError(message || "The offering was not accepted by the cosmic ledger.")
                } else {
                    setHasTechnicalError(true)
                    setError(message || "The astral channel faded into silence.")
                }
            },
        }

        const type = event.type?.type
        if (type && handlers[type]) {
            handlers[type](event)
        } else {
            console.warn("Unknown event:", event)
        }
    }, [router])

    useStomp(userId, processId, handleStompEvent)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setHasTechnicalError(false)
        setHasBusinessError(false)
        setIsPaymentError(false)

        if (!/^\d{6}$/.test(blikCode)) {
            setError("A sacred code must be 6 glyphs in length.")
            return
        }

        setIsProcessing(true)
        await processPayment({userId, processId, blikCode})
    }

    if (!divinationData) {
        return (
            <div className="witch-card bg-black/50 backdrop-blur-sm text-center p-6">
                <p>The spirits whisper of missing intent... No prophecy may be revealed.</p>
                <button onClick={() => router.push("/")} className="mystical-button mt-4">
                    Return to the Mortal Realm
                </button>
            </div>
        )
    }

    const finalCost = 1

    return (
        <div className="witch-card bg-black/50 backdrop-blur-sm">
            {isProcessing && !hasTechnicalError && !hasBusinessError ? (
                <PaymentAnimation hasError={isPaymentError}/>
            ) : hasTechnicalError ? (
                <TechnicalErrorView/>
            ) : hasBusinessError ? (
                <BusinessErrorView/>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-6 p-4 border border-white/10 rounded-sm">
                        <div className="flex justify-between items-center text-lg font-medium">
                            <span>Mystical Tribute:</span>
                            <span>${finalCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="blikCode" className="witch-label">Astral BLIK Sigil</label>
                            <input
                                type="text"
                                id="blikCode"
                                value={blikCode}
                                onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="witch-input text-center text-2xl tracking-widest"
                                placeholder="______"
                                maxLength={6}
                                pattern="\d{6}"
                                required
                            />
                            <p className="text-xs text-center mt-2 opacity-70">
                                Inscribe the 6-digit glyph from your ritual banking scroll
                            </p>
                        </div>
                        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                        {paymentError && <div className="text-red-400 text-sm text-center">{paymentError}</div>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="mystical-button w-full flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            <Sparkles className="h-4 w-4 mr-2"/>
                            Invoke the BLIK Rite
                        </button>
                    </div>

                    <div className="text-center text-xs opacity-70 pt-2">
                        <p>
                            By invoking this rite, you submit to our{" "}
                            <a
                                href="https://www.facebook.com/profile.php?id=100091842926056"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="terms-link underline hover:text-white transition-colors"
                            >
                                cosmic terms and ethereal conditions
                            </a>
                        </p>
                    </div>
                </form>
            )}
        </div>
    )
}
