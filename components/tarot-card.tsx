"use client"

import { useState } from "react"

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

  // Update the renderCardSymbol function with new designs for The Sun, The Tower, and The Devil
  const renderCardSymbol = (cardName: string) => {
    if (cardName.includes("Moon")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          <path
            d="M17 15C16.2 15.2 15.4 15.3 14.5 15.3C9.8 15.3 6 11.5 6 6.8C6 5.9 6.1 5.1 6.3 4.3C3.9 5.7 2.3 8.2 2.3 11C2.3 15.4 5.9 19 10.3 19C13.1 19 15.6 17.4 17 15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    }

    if (cardName.includes("Star")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          <path
            d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    }

    if (cardName.includes("Death")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          <path d="M8 8L16 16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 8L8 16" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }

    if (cardName.includes("Tower")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          <rect x="8" y="6" width="8" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 20H18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6L12 2L14 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 10L19 16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }

    if (cardName.includes("Wheel")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 4V20" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }

    if (cardName.includes("Lovers")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          <circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8C8 8 10 6 12 6C14 6 16 8 16 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )
    }

    if (cardName.includes("Sun")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 3V5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 19V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 12H5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M19 12H21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 5L7 7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M17 17L19 19" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 19L7 17" stroke="currentColor" strokeWidth="1.5" />
          <path d="M17 7L19 5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }

    if (cardName.includes("Devil")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          {/* Simple pentagram for the Devil card */}
          <path
            d="M12 3L14.5 9.5L21 10L16.5 14.5L18 21L12 17.5L6 21L7.5 14.5L3 10L9.5 9.5L12 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1" />
        </svg>
      )
    }

    if (cardName.includes("Justice")) {
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
          <path d="M12 4V16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 8H18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="18" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="8" y="16" width="8" height="2" fill="currentColor" />
        </svg>
      )
    }

    // Default symbol if no match
    return (
      <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
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
