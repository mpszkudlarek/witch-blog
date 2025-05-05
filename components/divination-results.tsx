"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { generateDivination, retryDivinationGeneration } from "@/actions/divination-actions"
import { HistoryService } from "@/services/history-service"
import DivinationLoading from "./divination-loading"
import TarotCard from "./tarot-card"
import { Sparkles, Star, Moon, Scroll, Wand2 } from "lucide-react"
import type { DivinationFormData, TarotCard as TarotCardType } from "@/types"

/**
 * DivinationResults component displays the results of a tarot reading
 * Shows tarot cards and personalized reading based on user input
 */
export default function DivinationResults() {
  const router = useRouter()

  // Component state
  const [isLoading, setIsLoading] = useState(true)
  const [divinationData, setDivinationData] = useState<DivinationFormData | null>(null)
  const [tarotCards, setTarotCards] = useState<TarotCardType[]>([])
  const [reading, setReading] = useState("")
  const [error, setError] = useState("")
  const [showReading, setShowReading] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isOpenAIError, setIsOpenAIError] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
  const [resultSaved, setResultSaved] = useState(false)
  const [clickedCards, setClickedCards] = useState<boolean[]>([false, false, false])
  const allCardsClicked = clickedCards.every((clicked) => clicked)

  // Add a ref to store the original cards
  const originalCardsRef = useRef<TarotCardType[]>([])

  // Fetch divination data on component mount
  useEffect(() => {
    const fetchDivination = async () => {
      try {
        // Retrieve the stored divination data and transaction ID
        const storedData = sessionStorage.getItem("divinationData")
        const storedTransactionId = sessionStorage.getItem("transactionId")

        if (storedTransactionId) {
          setTransactionId(storedTransactionId)
        }

        if (!storedData) {
          setError("No divination data found")
          setIsLoading(false)
          return
        }

        try {
          // Parse the stored data
          const userData = JSON.parse(storedData) as DivinationFormData
          setDivinationData(userData)

          // Generate the divination using the server action
          const result = await generateDivination(userData)

          if (result.success && result.tarotCards) {
            // Store the original cards in the ref
            originalCardsRef.current = [...result.tarotCards]
            setTarotCards(result.tarotCards)

            if (result.reading) {
              setReading(result.reading)
            }

            // Handle OpenAI error state if present
            if (result.openAIError) {
              setIsOpenAIError(true)
              setError(result.message || "Failed to connect to AI service")
            } else if (result.reading) {
              // Save successful result to history
              HistoryService.saveToHistory(userData, result)
              setResultSaved(true)
            }
          } else {
            setError(result.message || "Failed to generate divination")
          }
        } catch (e) {
          console.error("Error parsing stored data:", e)
          setError("Invalid session data")
        }
      } catch (error) {
        console.error("Error fetching divination:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDivination()
  }, [])

  /**
   * Retry the OpenAI generation if it failed initially
   */
  const handleRetry = async () => {
    if (!divinationData) return

    setIsRetrying(true)
    setError("")

    try {
      // Call the retry server action
      const result = await retryDivinationGeneration(divinationData)

      if (result.success) {
        if (result.reading) {
          setReading(result.reading)
          setIsOpenAIError(false)

          // Save successful retry to history
          if (!resultSaved && divinationData) {
            HistoryService.saveToHistory(divinationData, result)
            setResultSaved(true)
          }
        } else if (result.openAIError) {
          setError(result.message || "Failed to connect to AI service")
        } else {
          setError(result.message || "Failed to generate divination")
        }
      } else {
        setError(result.message || "Failed to generate divination")
      }
    } catch (error) {
      console.error("Error retrying divination:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsRetrying(false)
    }
  }

  /**
   * Handle returning to the sacred portal
   */
  const handleReturnToPortal = () => {
    if (!showReading) {
      // If reading hasn't been revealed, just go back
      router.push("/")
    } else {
      // If reading has been revealed, show confirmation first
      setShowLeaveConfirmation(true)
    }
  }

  /**
   * Navigate to history page
   */
  const handleViewHistory = () => {
    router.push("/history")
  }

  /**
   * Confirm leaving the divination page
   */
  const confirmLeave = () => {
    router.push("/")
  }

  /**
   * Cancel leaving the divination page
   */
  const cancelLeave = () => {
    setShowLeaveConfirmation(false)
  }

  /**
   * Handle card click with stable card identity
   */
  const handleCardClick = (index: number) => {
    // Use the original cards from the ref to ensure stability
    if (originalCardsRef.current.length > 0) {
      const newClickedCards = [...clickedCards]
      newClickedCards[index] = true
      setClickedCards(newClickedCards)
    }
  }

  // Show loading state while fetching divination
  if (isLoading) {
    return <DivinationLoading />
  }

  // Show error state if no tarot cards could be generated
  if (error && !tarotCards.length) {
    return (
      <div className="witch-card bg-black/50 backdrop-blur-sm text-center p-6">
        <p>{error}</p>
        <button onClick={() => router.push("/")} className="mystical-button mt-4">
          Return Home
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tarot Card Spread - Display only 3 randomly selected cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tarotCards.map((card, index) => (
          <TarotCard
            key={`${card.name}-${index}`} // Add index to key for stability
            name={card.name}
            image={card.image}
            description={card.description}
            reversed={card.reversed}
            onCardClick={() => handleCardClick(index)}
          />
        ))}
      </div>

      {/* Reveal Reading Button - shown only before reading is revealed */}
      {!showReading && (
        <div className="text-center">
          {allCardsClicked ? (
            <button
              onClick={() => setShowReading(true)}
              className="mystical-button flex items-center justify-center mx-auto"
            >
              <Wand2 className="h-4 w-4 mr-2 opacity-60" />
              Reveal Your Reading
            </button>
          ) : (
            <p className="text-sm opacity-70 italic">Click all three cards to reveal your reading</p>
          )}
        </div>
      )}

      {/* Reading Content - shown after reveal button is clicked */}
      {showReading && (
        <div className="witch-card bg-black/50 backdrop-blur-sm p-6 border border-white/10 animate-fadeIn">
          {isOpenAIError ? (
            // OpenAI Error State
            <div className="text-center">
              <div className="mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center">
                    <Star className="h-6 w-6 text-white/40" />
                  </div>
                  <div
                    className="absolute top-0 left-0 w-4 h-4 rounded-full bg-white/10 animate-pulse"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="absolute top-1/4 right-0 w-3 h-3 rounded-full bg-white/10 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-1/4 w-2 h-2 rounded-full bg-white/10 animate-pulse"
                    style={{ animationDelay: "0.8s" }}
                  ></div>
                </div>

                <h3 className="text-xl font-serif mb-3">The Cosmic Threads Are Tangled</h3>
                <p className="text-white/80 font-light italic">
                  The celestial energies are unusually turbulent, and our seers are struggling to channel your reading
                  clearly. The astral plane is crowded with seekers, and your message awaits its turn to manifest.
                </p>
                <p className="text-white/70 mt-3 text-sm">
                  If the ethereal whispers remain silent for more than a moment, summon them again with the ritual
                  below.
                </p>
              </div>

              {/* Retry Button */}
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="mystical-button flex items-center justify-center mx-auto"
              >
                {isRetrying ? (
                  <span className="flex items-center">
                    <span className="animate-pulse mr-2">✧</span>
                    Channeling...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 opacity-60" />
                    Summon the Whispers Again
                  </span>
                )}
              </button>
            </div>
          ) : (
            // Successful Reading Display
            <>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                  <Scroll className="h-4 w-4 opacity-40" />
                </div>
                <div className="mx-3 h-px w-12 bg-white/20"></div>
                <h2 className="text-xl font-serif tracking-wide">Your Mystical Reading</h2>
              </div>

              <div className="space-y-4 leading-relaxed">
                {reading.split("\n\n").map((paragraph, index) => (
                  <p key={index} className={`${index === 0 ? "font-serif text-lg" : ""} text-white/90`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons - only visible after reading is revealed */}
      {showReading && (
        <div className="text-center pt-4">
          <button onClick={handleReturnToPortal} className="mystical-button flex items-center justify-center mx-auto">
            <Moon className="h-4 w-4 mr-2 opacity-60" />
            Return to Sacred Portal
          </button>
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="witch-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-serif text-center">The Veil Trembles</h3>
            <p className="text-white/80 text-center">
              Are you certain you wish to depart from this sacred reading? The cosmic energies that have aligned for you
              may not manifest in the same pattern again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button onClick={confirmLeave} className="mystical-button">
                Yes, I Shall Return to the Portal
              </button>
              <button onClick={cancelLeave} className="mystical-button bg-opacity-50">
                No, I Will Remain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
