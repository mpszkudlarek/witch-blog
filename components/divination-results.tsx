"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DivinationLoading from "./divination-loading"
import TarotCard from "./tarot-card"
import { Sparkles, Star, Moon, Scroll, Wand2 } from "lucide-react"

interface StoredCard {
  cardName: string
  description: string
  isReversed: boolean
}

export default function DivinationResults() {
  const router = useRouter()

  const [cards, setCards] = useState<StoredCard[]>([])
  const [reading, setReading] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
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
      setCards(JSON.parse(rawCards))
      setReading(rawReading)
    } catch (err) {
      console.error("Error parsing stored data:", err)
      router.push("/")
    } finally {
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [router])

  const allCardsClicked = clickedCards.every((clicked) => clicked)

  const handleCardClick = (index: number) => {
    const newClicked = [...clickedCards]
    newClicked[index] = true
    setClickedCards(newClicked)
  }

  const handleReturnToPortal = () => {
    if (!showReading) router.push("/")
    else setShowLeaveConfirmation(true)
  }

  const confirmLeave = () => router.push("/")
  const cancelLeave = () => setShowLeaveConfirmation(false)

  if (isLoading) return <DivinationLoading />

  return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
              <TarotCard
                  key={`card-${index}`}
                  name={card.cardName}
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
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                  <Scroll className="h-4 w-4 opacity-40" />
                </div>
                <div className="mx-3 h-px w-12 bg-white/20"></div>
                <h2 className="text-xl font-serif tracking-wide">Your Mystical Reading</h2>
              </div>
              <div className="space-y-4 leading-relaxed">
                {reading.split("\n\n").map((paragraph, i) => (
                    <p key={i} className={`${i === 0 ? "font-serif text-lg" : ""} text-white/90`}>{paragraph}</p>
                ))}
              </div>
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
                style={{ margin: 0, padding: 0, inset: 0, maxHeight: "100vh", height: "100vh" }}
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
