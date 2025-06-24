"use client"

import {useState} from "react"
import {cardIcons} from "@/lib/tarot-utils"

interface TarotCardProps {
    name: string
    image: string
    description: string
    reversed?: boolean
    delay?: number
    alwaysShowFront?: boolean
    onCardClick?: () => void
}

export default function TarotCard({
                                      name,
                                      image,
                                      description,
                                      reversed = false,
                                      alwaysShowFront = false,
                                      onCardClick,
                                  }: TarotCardProps) {
    const [isFlipped, setIsFlipped] = useState(alwaysShowFront)

    const handleClick = () => {
        if (alwaysShowFront || isFlipped) return
        setIsFlipped(true)
        onCardClick?.()
    }

    const renderCardSymbol = (imageName: string) => {
        const iconFile = cardIcons[imageName.toLowerCase()] || "default-icon.svg"
        return (
            <img
                src={`/icons/${iconFile}`}
                alt={imageName}
                className="w-12 h-12 mx-auto invert"
            />
        )
    }

    return (
        <div
            className={`tarot-card-container mx-auto ${isFlipped ? "flipped" : ""}`}
            title={name}
            data-testid={`tarot-card-${image.toLowerCase()}`}
        >
            <div
                className={`tarot-card-inner ${isFlipped ? "transform rotate-y-180" : ""}`}
                style={{transform: isFlipped ? "rotateY(180deg)" : ""}}
                onClick={handleClick}
            >
                {/* Card Back */}
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
                    <div className="tarot-card-back-text">
                        {alwaysShowFront ? "" : "Click to reveal"}
                    </div>
                </div>

                {/* Card Front */}
                <div className={`tarot-card-front ${reversed ? "reversed" : ""}`}>
                    <div className="tarot-card-front-header">
                        <h3 className="tarot-card-title">
                            {name} {reversed && "(Reversed)"}
                        </h3>
                    </div>

                    <div className="tarot-card-front-image">
                        <div className="tarot-symbol">{renderCardSymbol(image)}</div>
                    </div>

                    <div className="tarot-card-front-footer">
                        <p className="tarot-card-description">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
