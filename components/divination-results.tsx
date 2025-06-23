"use client"

import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import DivinationLoading from "./divination-loading"
import TarotCard from "./tarot-card"
import {Moon, Scroll, Wand2} from "lucide-react"
import ReactMarkdown from "react-markdown"

interface StoredCard {
    cardName: string
    description: string
    isReversed: boolean
}

const STATIC_READING_RAW = `# A Mystical Reading for 12\\n\\nGreetings, dear 12. As I channel the energies of the universe, let us delve into the essence of the tarot cards drawn for you today: **The Sun**, **The Moon** (reversed), and **Justice**. Each of these cards carries a unique message that resonates with your personal journey.\\n\\n## The Sun 🌞\\n\\n**Joy, Success, Optimism**\\n\\nThe radiant energy of **The Sun** illuminates your path. This card heralds a time of happiness and success, suggesting that your recent endeavors will bear fruit. The optimism that surrounds you is not merely a fleeting moment; it is a deep-seated joy that suggests you are on the right track. Embrace this warmth, for it signifies growth and positive outcomes in various facets of your life.\\n\\n## The Moon (Reversed) 🌙\\n\\n**Illusion, Fear, Subconscious (Negative Influence)**\\n\\nYet, beware of the shadows cast by **The Moon** in its reversed position. This card invites you to confront hidden fears and illusions that may be lurking beneath the surface. It may be tempting to avoid these darker aspects, but now is the time to face them with courage and clarity. Ignoring these issues may lead to confusion and misdirection. Allow the light of **The Sun** to guide you through this murky terrain, illuminating truths that you must acknowledge for your growth.\\n\\n## Justice ⚖️\\n\\n**Balance, Truth, Fairness**\\n\\nThe presence of **Justice** reminds you of the importance of balance in your life. This card signifies that fairness and truth will prevail, suggesting that your current circumstances will align with the principles of equity. Trust in the process of unfolding events, as they will lead you toward resolution and harmony. Your journey may require you to stand firm in your beliefs and seek the truth, ensuring that you remain aligned with your authentic self.\\n\\n## Conclusion\\n\\nDear 12, your reading reflects a powerful journey of transformation. While the **Sun** shines brightly upon you, illuminating joy and success, it is essential to confront the darkness represented by **The Moon**. Balance these energies with the truth of **Justice**, which will guide you toward a harmonious existence.\\n\\n### Your Mantra\\n\\n*\\\"Embrace the light, confront the shadows, and let truth be your guide.\\\"*`

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
        if (!rawCards) {
            router.push("/")
            return
        }

        try {
            setCards(JSON.parse(rawCards))
            setReading(STATIC_READING_RAW.replace(/\\n/g, "\n"))
            // setReading(rawReading.replace(/\\n/g, "\n"))
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

    if (isLoading) return <DivinationLoading/>

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
                            <button onClick={confirmLeave} className="mystical-button">
                                Yes, I Shall Return
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
