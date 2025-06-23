"use client"

import {useState, useEffect, useCallback, useRef} from "react"
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

    const [userId] = useState(() => searchParams.get("userId") || "")
    const [processId] = useState(() => searchParams.get("processId") || "")

    const [blikCode, setBlikCode] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState("")
    const [divinationData, setDivinationData] = useState<DivinationFormData | null>(null)
    const [hasTechnicalError, setHasTechnicalError] = useState(false)
    const [hasBusinessError, setHasBusinessError] = useState(false)
    const [isPaymentError, setIsPaymentError] = useState(false)

    const {processPayment, isLoading: isSubmitting, error: paymentError} = usePayment()

    const ignoreEventsRef = useRef(false)

    useEffect(() => {
        const storedData = sessionStorage.getItem("divinationData")
        if (storedData) {
            try {
                setDivinationData(JSON.parse(storedData))
            } catch (e) {
                console.error("Error parsing stored divination data:", e)
                setError("Invalid session data. Please return to the form.")
            }
        }
    }, [])

    const handleStompEvent = useCallback((event: FrontendEvent) => {
        if (ignoreEventsRef.current) return
        console.log("📦 Received event from backend:", JSON.stringify(event, null, 2))

        switch (event.type.type) {
            case "process.started": {
                const started = event as ProcessStartedEvent
                console.log("🟢 Process started:", started.processId)
                break
            }

            case "payment.completed": {
                const payment = event as PaymentCompletedEvent
                switch (payment.state) {
                    case PaymentState.PAYMENT_SUCCEEDED:
                        console.log("💰 Payment success, waiting for divination...")
                        break
                    case PaymentState.PAYMENT_FAILED_BUSINESS_ERROR:
                        setHasBusinessError(true)
                        setError(payment.message || "A business error occurred.")
                        break
                    case PaymentState.PAYMENT_FAILED_TECHNICAL_ERROR:
                        setHasTechnicalError(true)
                        setError(payment.message || "A technical error occurred.")
                        break
                    default:
                        setIsPaymentError(true)
                        setError(payment.message || "Payment failed. Please try again.")
                }
                break
            }

            case "payment.blik.incorrect": {
                const incorrect = event as IncorrectBLIKCodeEvent
                setIsPaymentError(true)
                setError(incorrect.message || "Incorrect BLIK code.")
                break
            }

            case "divination.requested": {
                const requested = event as DivinationRequestedEvent
                sessionStorage.setItem("divinationCards", JSON.stringify(requested.cards))
                break
            }

            case "divination.generation": {
                const generation = event as DivinationGenerationEvent
                sessionStorage.setItem("divinationResult", JSON.stringify({
                    divination: generation.divination ?? "Unknown reading",
                    status: generation.status ?? "SUCCESS"
                }))
                ignoreEventsRef.current = true
                router.push("/divination")
                break
            }

            case "error.business": {
                const business = event as BusinessErrorEvent
                setHasBusinessError(true)
                setError(business.message || "A business error occurred.")
                break
            }

            case "error.technical": {
                const technical = event as TechnicalErrorEvent
                setHasTechnicalError(true)
                setError(technical.message || "A technical error occurred.")
                break
            }

            case "process.ended": {
                const ended = event as ProcessEndedEvent
                switch (ended.status) {
                    case "FinishedWithWrongPaymentStatus":
                        setHasBusinessError(true)
                        setError(ended.message || "The payment status was invalid.")
                        break
                    default:
                        setHasTechnicalError(true)
                        setError(ended.message || "The connection was closed.")
                }
                break
            }


            default:
                console.log("🧾 Unknown event (JSON):", JSON.stringify(event, null, 2))
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
            setError("Please enter a valid 6-digit BLIK code")
            return
        }

        setIsProcessing(true)
        await processPayment({userId, processId, blikCode})
    }

    if (!divinationData) {
        return (
            <div className="witch-card bg-black/50 backdrop-blur-sm text-center p-6">
                <p>No divination data found. Please return to the home page.</p>
                <button onClick={() => router.push("/")} className="mystical-button mt-4">
                    Return Home
                </button>
            </div>
        )
    }

    const finalCost = 15

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
                            <span>Total:</span>
                            <span>${finalCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="blikCode" className="witch-label">
                                BLIK Code
                            </label>
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
                                Enter the 6-digit code from your banking app
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
                            Complete Payment
                        </button>
                    </div>

                    <div className="text-center text-xs opacity-70 pt-2">
                        <p>
                            By proceeding, you agree to our{" "}
                            <a
                                href="https://www.facebook.com/profile.php?id=100091842926056"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="terms-link underline hover:text-white transition-colors"
                            >
                                terms and conditions
                            </a>
                        </p>
                    </div>
                </form>
            )}
        </div>
    )
}
