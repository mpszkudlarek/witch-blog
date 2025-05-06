"use client"

import { useState } from "react"
import { Moon, Star, Sun, X, Building, Dices, Heart, Skull, Scale } from "lucide-react"

// Update the TarotCardProps interface to include the onCardClick callback
interface TarotCardProps {
    /** The name of the tarot card */
    name: string
    /** The image path for the tarot card */
    image: string
    /** The description or meaning of the tarot card */
    description: string
    /** Whether the card is reversed (upside down) */
    reversed?: boolean
    /** Optional delay for animations (in milliseconds) */
    delay?: number
    /** Whether to always show the front of the card (for history view) */
    alwaysShowFront?: boolean
    /** Callback when card is clicked/flipped */
    onCardClick?: () => void
}

/**
 * TarotCard component displays a flippable tarot card with front and back sides
 * The card can be flipped by clicking on it to reveal its meaning
 */
export default function TarotCard({
                                      name,
                                      image,
                                      description,
                                      reversed = false,
                                      delay = 0,
                                      alwaysShowFront = false,
                                      onCardClick,
                                  }: TarotCardProps) {
    // Track whether the card is flipped to show the front or back
    const [isFlipped, setIsFlipped] = useState(alwaysShowFront)

    // Modify the handleClick function to call the onCardClick callback
    const handleClick = () => {
        if (!alwaysShowFront) {
            setIsFlipped(!isFlipped)
            // Call the onCardClick callback when the card is flipped to front
            if (!isFlipped && onCardClick) {
                onCardClick()
            }
        }
    }

    // Render the appropriate icon based on the card name
    const renderCardSymbol = (cardName: string) => {
        const iconName = (() => {
            if (cardName.includes("Moon")) return "moon-icon.svg"
            if (cardName.includes("Star")) return "star-icon.svg"
            if (cardName.includes("Sun")) return "sun-icon.svg"
            if (cardName.includes("Death")) return "death-icon.svg"
            if (cardName.includes("Tower")) return "tower-icon.svg"
            if (cardName.includes("Wheel")) return "wheel-icon.svg"
            if (cardName.includes("Lovers")) return "lovers-icon.svg"
            if (cardName.includes("Justice")) return "justice-icon.svg"
            if (cardName.includes("Devil")) return "devil-icon.svg"
            return "default-icon.svg"
        })()

        return (
            <img
                src={`/icons/${iconName}`}
                alt={cardName}
                className="w-12 h-12 mx-auto invert"
            />
        )
    }
    return (
        <div className={`tarot-card-container mx-auto ${isFlipped ? "flipped" : ""}`}>
            <div
                className={`tarot-card-inner ${isFlipped ? "transform rotate-y-180" : ""}`}
                style={{ transform: isFlipped ? "rotateY(180deg)" : "" }}
                onClick={handleClick}
            >
                {/* Card Back - shown when not flipped */}
                <div className="tarot-card-back">
                    <div className="tarot-card-back-design">
                        <div className="tarot-card-back-border"></div>
                        <div className="tarot-card-back-pattern"></div>
                        <div className="tarot-card-back-symbol">✧</div>
                        <div className="tarot-card-back-circle"></div>
                        <div className="tarot-card-back-inner-border"></div>
                        <div className="tarot-card-back-stars">
                            <span className="star-1">✦</span>
                            <span className="star-2">✧</span>
                            <span className="star-3">✦</span>
                            <span className="star-4">✧</span>
                        </div>
                    </div>
                    <div className="tarot-card-back-text">{alwaysShowFront ? "" : "Click to reveal"}</div>
                </div>

                {/* Card Front - shown when flipped */}
                <div className={`tarot-card-front ${reversed ? "reversed" : ""}`}>
                    <div className="tarot-card-front-header">
                        <h3 className="tarot-card-title">
                            {name} {reversed && "(Reversed)"}
                        </h3>
                    </div>

                    <div className="tarot-card-front-image">
                        {/* Display SVG symbol based on card name */}
                        <div className="tarot-symbol">{renderCardSymbol(name)}</div>
                    </div>

                    <div className="tarot-card-front-footer">
                        <p className="tarot-card-description">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
