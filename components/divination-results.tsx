"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDivination } from "@/hooks/use-divination"
import DivinationLoading from "./divination-loading"
import TarotCard from "./tarot-card"
import { Sparkles, Star, Moon, Scroll, Wand2 } from "lucide-react"

export default function DivinationResults() {
  const router = useRouter()
  const {
    isLoading,
    error,
    tarotCards,
    reading,
    isOpenAIError,
    isRetrying,
    generateReading,
    retryReading,
    divinationData,
    setDivinationData,
  } = useDivination()

  const [showReading, setShowReading] = useState(false)
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
  const [clickedCards, setClickedCards] = useState<boolean[]>([false, false, false])
  const allCardsClicked = clickedCards.every((clicked) => clicked)
  useRef<typeof tarotCards>([]);
  useEffect(() => {
    const run = async () => {
      const storedData = sessionStorage.getItem("divinationData")
      if (!storedData) return

      try {
        const userData = JSON.parse(storedData)
        setDivinationData(userData)
        await generateReading(userData)
      } catch (err) {
        console.error("Invalid session data:", err)
      }
    }

    void run()
  }, [generateReading, setDivinationData])

  const handleCardClick = (index: number) => {
    const newClicked = [...clickedCards]
    newClicked[index] = true
    setClickedCards(newClicked)
  }

  const handleRetry = () => {
    if (divinationData) void retryReading(divinationData)
  }

  const handleReturnToPortal = () => {
    if (!showReading) router.push("/")
    else setShowLeaveConfirmation(true)
  }

  const confirmLeave = () => router.push("/")
  const cancelLeave = () => setShowLeaveConfirmation(false)

  if (isLoading) return <DivinationLoading />

  if (error && tarotCards.length === 0) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tarotCards.map((card, index) => (
              <TarotCard
                  key={card.id || `card-${index}`}
                  name={card.name}
                  image={card.image}
                  description={card.description}
                  reversed={card.reversed}
                  onCardClick={() => handleCardClick(index)}
              />
          ))}
        </div>

        {!showReading && (
            <div className="text-center">
              {allCardsClicked ? (
                  <button onClick={() => setShowReading(true)} className="mystical-button flex items-center justify-center mx-auto">
                    <Wand2 className="h-4 w-4 mr-2 opacity-60" />
                    Reveal Your Reading
                  </button>
              ) : (
                  <p className="text-sm opacity-70 italic">Click all three cards to reveal your reading</p>
              )}
            </div>
        )}

        {showReading && (
            <div className="witch-card bg-black/50 backdrop-blur-sm p-6 border border-white/10 animate-fadeIn">
              {isOpenAIError ? (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center">
                          <Star className="h-6 w-6 text-white/40" />
                        </div>
                        <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                        <div className="absolute top-1/4 right-0 w-3 h-3 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                        <div className="absolute bottom-0 left-1/4 w-2 h-2 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: "0.8s" }}></div>
                      </div>
                      <h3 className="text-xl font-serif mb-3">The Cosmic Threads Are Tangled</h3>
                      <p className="text-white/80 font-light italic">
                        The celestial energies are unusually turbulent, and our seers are struggling to channel your reading clearly.
                      </p>
                      <p className="text-white/70 mt-3 text-sm">
                        If the ethereal whispers remain silent, summon them again with the ritual below.
                      </p>
                    </div>
                    <button onClick={handleRetry} disabled={isRetrying} className="mystical-button flex items-center justify-center mx-auto">
                      {isRetrying ? (
                          <span className="flex items-center">
                    <span className="animate-pulse mr-2">✧</span> Channeling...
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
                  <>
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                        <Scroll className="h-4 w-4 opacity-40" />
                      </div>
                      <div className="mx-3 h-px w-12 bg-white/20"></div>
                      <h2 className="text-xl font-serif tracking-wide">Your Mystical Reading</h2>
                    </div>
                    <div className="space-y-4 leading-relaxed">
                      {reading?.split("\n\n").map((paragraph, i) => (
                          <p key={i} className={`${i === 0 ? "font-serif text-lg" : ""} text-white/90`}>{paragraph}</p>
                      ))}
                    </div>
                  </>
              )}
            </div>
        )}

        {showReading && (
            <div className="text-center pt-4">
              <button onClick={handleReturnToPortal} className="mystical-button flex items-center justify-center mx-auto">
                <Moon className="h-4 w-4 mr-2 opacity-60" />
                Return to Sacred Portal
              </button>
            </div>
        )}

        {showLeaveConfirmation && (
            <div
                className="fixed top-0 left-0 w-full h-full z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center"
                style={{
                  margin: 0,
                  padding: 0,
                  inset: 0,
                  maxHeight: "100vh",
                  height: "100vh",
                }}
            >
              <div className="witch-card max-w-md w-full p-6 space-y-4">
                <h3 className="text-xl font-serif text-center">The Veil Trembles</h3>
                <p className="text-white/80 text-center">
                  Are you sure you wish to leave? The cosmic energies may not align the same way again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button onClick={confirmLeave} className="mystical-button">Yes, I Shall Return</button>
                  <button onClick={cancelLeave} className="mystical-button bg-opacity-50">No, I Will Remain</button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}
