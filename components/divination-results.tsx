"use client"

import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {Moon, Scroll, Wand2, RotateCw} from "lucide-react"
import ReactMarkdown from "react-markdown"

import TarotCard from "./tarot-card"
import DivinationLoading from "./divination-loading"

import {formatCardName} from "@/lib/tarot-utils"
import type {RawTarotCard} from "@/types/raw"

export default function DivinationResults() {
    const router = useRouter()

    const [cards, setCards] = useState<RawTarotCard[]>([])
    const [reading, setReading] = useState<string>("")
    const [isFailure, setIsFailure] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [retryError, setRetryError] = useState(false)
    const [showReading, setShowReading] = useState(false)
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
    const [clickedCards, setClickedCards] = useState<boolean[]>([false, false, false])

    useEffect(() => {
        const rawCards = sessionStorage.getItem("divinationCards")
        const rawReading = sessionStorage.getItem("divinationResult")

        if (!rawCards || !rawReading) {
            router.push("/")
            return
        }

        try {
            setCards(JSON.parse(rawCards) as RawTarotCard[])

            try {
                const parsed = JSON.parse(rawReading)

                if (typeof parsed === "string") {
                    setReading(parsed)
                } else {
                    setReading(parsed.divination ?? "Unknown result")
                    if (parsed.status === "FAILURE") {
                        setIsFailure(true)
                    }
                }
            } catch {
                setReading(rawReading.replace(/\\n/g, "\n"))
            }
        } catch (err) {
            console.error("Error parsing stored data:", err)
            router.push("/")
        } finally {
            setTimeout(() => setIsLoading(false), 500)
        }
    }, [router])

    const allCardsClicked = clickedCards.every(Boolean)

    const handleCardClick = (index: number) => {
        const updated = [...clickedCards]
        updated[index] = true
        setClickedCards(updated)
    }

    const handleReturnToPortal = () => {
        if (!showReading) router.push("/")
        else setShowLeaveConfirmation(true)
    }

    const handleRetry = async () => {
        const processId = sessionStorage.getItem("divinationProcessId")

        if (!processId) {
            console.error("Missing process ID")
            setRetryError(true)
            return
        }

        try {
            const res = await fetch(`http://localhost:8080/divination-service/retry/${processId}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
            })

            if (!res.ok) {
                console.error(`Retry failed with status ${res.status}`)
                setRetryError(true)
                return
            }

            const newReading = await res.text()

            setReading(newReading)
            setIsFailure(false)
            setRetryError(false)
            sessionStorage.setItem("divinationResult", JSON.stringify(newReading))
        } catch (err) {
            console.error("Retry request failed:", err)
            setRetryError(true)
        }
    }

    if (isLoading) return <DivinationLoading/>

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <TarotCard
                        key={`card-${index}`}
                        name={formatCardName(card.cardName)}
                        description={card.description}
                        reversed={card.isReversed}
                        image={card.cardName}
                        onCardClick={() => handleCardClick(index)}
                    />
                ))}
            </div>

            {!showReading && (
                <div className="text-center">
                    {allCardsClicked ? (
                        <button
                            onClick={() => setShowReading(true)}
                            className="mystical-button flex items-center justify-center mx-auto"
                        >
                            <Wand2 className="h-4 w-4 mr-2 opacity-60"/>
                            Reveal Your Reading
                        </button>
                    ) : (
                        <p className="text-sm opacity-70 italic">
                            Click all three cards to reveal your reading
                        </p>
                    )}
                </div>
            )}

            {showReading && (
                <div className="witch-card bg-black/50 backdrop-blur-sm p-6 border border-white/10 animate-fadeIn">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                            <Scroll className="h-4 w-4 opacity-40"/>
                        </div>
                        <div className="mx-3 h-px w-12 bg-white/20"></div>
                        <h2 className="text-xl font-serif tracking-wide">Your Mystical Reading</h2>
                    </div>

                    <div
                        className="prose prose-invert max-w-none text-white/90 prose-headings:font-serif prose-p:font-light prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed">
                        <ReactMarkdown>{reading}</ReactMarkdown>
                    </div>

                    {isFailure && (
                        <div className="text-center pt-6 space-y-4">
                            {retryError && (
                                <div className="text-red-400 text-sm">
                                    The aether trembled — retrying the ritual failed. Please try again.
                                </div>
                            )}
                            <button
                                onClick={handleRetry}
                                className="mystical-button flex items-center justify-center mx-auto"
                            >
                                <RotateCw className="h-4 w-4 mr-2"/>
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showReading && (
                <div className="text-center pt-4">
                    <button
                        onClick={handleReturnToPortal}
                        className="mystical-button flex items-center justify-center mx-auto"
                    >
                        <Moon className="h-4 w-4 mr-2 opacity-60"/>
                        Return to Sacred Portal
                    </button>
                </div>
            )}

            {showLeaveConfirmation && (
                <div className="fixed top-0 left-0 w-full h-full z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <div className="witch-card max-w-md w-full p-6 space-y-4">
                        <h3 className="text-xl font-serif text-center">The Veil Trembles</h3>
                        <p className="text-white/80 text-center">
                            Are you sure you wish to leave? The cosmic energies may not align the same way again.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <button onClick={() => router.push("/")} className="mystical-button">
                                Yes, I Shall Return
                            </button>
                            <button onClick={() => setShowLeaveConfirmation(false)} className="mystical-button bg-opacity-50">
                                No, I Will Remain
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
