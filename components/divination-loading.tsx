"use client"

import { useState, useEffect } from "react"

export default function DivinationLoading() {
  const [loadingText, setLoadingText] = useState("Connecting to the spiritual realm")

  useEffect(() => {
    const messages = [
      "Connecting to the spiritual realm",
      "Consulting the ancient wisdom",
      "Reading the cosmic energies",
      "Interpreting the celestial signs",
      "Aligning the tarot cards",
      "Channeling mystical forces",
      "Unveiling your destiny",
    ]

    let currentIndex = 0

    // Slow down the interval from 3000ms to 5000ms
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length
      setLoadingText(messages[currentIndex])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="witch-card bg-black/50 backdrop-blur-sm p-8">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="moon-loader"></div>

        <p className="text-lg font-serif animate-pulse transition-all duration-1000">{loadingText}...</p>

        <div className="flex space-x-2">
          <span className="animate-pulse delay-0 transition-opacity duration-1000">●</span>
          <span className="animate-pulse delay-150 transition-opacity duration-1000">●</span>
          <span className="animate-pulse delay-300 transition-opacity duration-1000">●</span>
        </div>
      </div>
    </div>
  )
}
