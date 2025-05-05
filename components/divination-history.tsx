"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HistoryService } from "@/services/history-service"
import { formatDistanceToNow } from "@/lib/date-utils"
import { Scroll, ArrowLeft, Trash2, Calendar, Clock, Moon, Sparkles, Wand2 } from "lucide-react"
import TarotCard from "./tarot-card"
import type { DivinationHistoryItem } from "@/types"

export default function DivinationHistory() {
  const router = useRouter()
  const [historyItems, setHistoryItems] = useState<DivinationHistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<DivinationHistoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    // Load history from local storage
    const loadHistory = () => {
      try {
        const history = HistoryService.getHistory()
        setHistoryItems(history)
        // Trigger animation after loading
        setTimeout(() => setAnimateIn(true), 100)
      } catch (error) {
        console.error("Error loading history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  // Update the handleViewReading function to pass alwaysShowFront to TarotCard
  const handleViewReading = (item: DivinationHistoryItem) => {
    setAnimateIn(false)
    setTimeout(() => {
      setSelectedItem(item)
      setTimeout(() => setAnimateIn(true), 100)
    }, 300)
  }

  const handleBackToList = () => {
    setAnimateIn(false)
    setTimeout(() => {
      setSelectedItem(null)
      setTimeout(() => setAnimateIn(true), 100)
    }, 300)
  }

  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the parent click handler
    setItemToDelete(id)
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      HistoryService.deleteHistoryItem(itemToDelete)
      setHistoryItems(historyItems.filter((item) => item.id !== itemToDelete))
      setShowDeleteConfirmation(false)
      setItemToDelete(null)

      // If the deleted item is currently selected, go back to the list
      if (selectedItem && selectedItem.id === itemToDelete) {
        setSelectedItem(null)
      }
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
    setItemToDelete(null)
  }

  const handleReturnHome = () => {
    router.push("/")
  }

  /**
   * Get a preview of the card symbols for a reading
   */
  const renderCardSymbolPreviews = (item: DivinationHistoryItem) => {
    return (
      <div className="flex space-x-2 items-center">
        {item.tarotCards.map((card, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center ${card.reversed ? "transform rotate-180" : ""}`}
          >
            {getCardSymbolPreview(card.name)}
          </div>
        ))}
      </div>
    )
  }

  /**
   * Get a simple symbol for card preview
   */
  const getCardSymbolPreview = (cardName: string) => {
    if (cardName.includes("Moon")) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
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
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
          <path
            d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    }
    if (cardName.includes("Sun")) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
          <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 3V5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 19V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 12H5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M19 12H21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }
    if (cardName.includes("Death")) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
          <path d="M8 8L16 16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 8L8 16" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }
    if (cardName.includes("Tower")) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
          <rect x="8" y="6" width="8" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 20H18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6L12 2L14 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }
    if (cardName.includes("Wheel")) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 4V20" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }
    if (cardName.includes("Lovers")) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
          <circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8C8 8 10 6 12 6C14 6 16 8 16 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )
    }
    if (cardName.includes("Devil")) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
          {/* Simple pentagram for the Devil card */}
          <path
            d="M12 3L14.5 9.5L21 10L16.5 14.5L18 21L12 17.5L6 21L7.5 14.5L3 10L9.5 9.5L12 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    }
    if (cardName.includes("Justice")) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
          <path d="M12 4V16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 8H18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="18" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    }
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" className="text-white/70">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }

  if (isLoading) {
    return (
      <div className="witch-card bg-black/50 backdrop-blur-sm text-center p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="moon-loader w-16 h-16"></div>
          <p className="text-white/80 animate-pulse">Retrieving your cosmic memories...</p>
        </div>
      </div>
    )
  }

  if (historyItems.length === 0) {
    return (
      <div
        className={`witch-card bg-black/50 backdrop-blur-sm text-center p-8 transition-all duration-500 ${animateIn ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
      >
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white/50" />
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

          <h3 className="text-2xl font-serif mb-4">The Cosmic Scroll Awaits</h3>
          <p className="text-white/80 font-light max-w-md mx-auto">
            Your journey through the mystical realms has yet to begin. When you receive your first divination, it will
            be recorded here in the cosmic memory, preserved for your future reflection.
          </p>
        </div>
        <button onClick={handleReturnHome} className="mystical-button flex items-center justify-center mx-auto">
          <Moon className="h-4 w-4 mr-2 opacity-80" />
          Return to Sacred Portal
        </button>
      </div>
    )
  }

  // Update the TarotCard rendering in the selectedItem view to always show front
  if (selectedItem) {
    return (
      <div
        className={`space-y-6 transition-all duration-500 ${animateIn ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
      >
        <button onClick={handleBackToList} className="mystical-button flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </button>

        <div className="witch-card bg-black/50 backdrop-blur-sm p-6 border border-white/10">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white/70" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-serif">
                  {new Date(selectedItem.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-sm opacity-70">{formatDistanceToNow(new Date(selectedItem.date))} ago</p>
              </div>
            </div>

            <div className="w-full h-px bg-white/10 my-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {selectedItem.tarotCards.map((card, index) => (
              <TarotCard
                key={index}
                name={card.name}
                image={card.image}
                description={card.description}
                reversed={card.reversed}
                alwaysShowFront={true}
              />
            ))}
          </div>

          <div className="mt-8 p-6 bg-black/30 border border-white/10 rounded-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                <Wand2 className="h-4 w-4 opacity-80" />
              </div>
              <div className="mx-3 h-px w-12 bg-white/20"></div>
              <h2 className="text-xl font-serif tracking-wide">Your Reading</h2>
            </div>

            <div className="space-y-4 leading-relaxed">
              {selectedItem.reading.split("\n\n").map((paragraph, index) => (
                <p key={index} className={`${index === 0 ? "font-serif text-lg" : ""} text-white/90`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`space-y-6 transition-all duration-500 ${animateIn ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
    >
      <div className="grid gap-4">
        {historyItems.map((item, index) => (
          <div
            key={item.id}
            className="witch-card bg-black/50 backdrop-blur-sm border border-white/10 p-0 cursor-pointer hover:bg-black/60 transition-all overflow-hidden witch-card-interactive"
            onClick={() => handleViewReading(item)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-white/70" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif mb-1">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="flex items-center text-sm opacity-70">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDistanceToNow(new Date(item.date))} ago</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeletePrompt(item.id, e)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Delete reading"
                >
                  <Trash2 className="h-4 w-4 opacity-70" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium opacity-80">Cards Revealed:</h4>
                {renderCardSymbolPreviews(item)}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {item.tarotCards.map((card, index) => (
                  <div key={index} className="px-2 py-1 bg-white/10 rounded-sm text-xs">
                    {card.name} {card.reversed && "(Reversed)"}
                  </div>
                ))}
              </div>

              <div className="relative">
                <p className="text-sm opacity-70 line-clamp-2">{item.reading.substring(0, 150)}...</p>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              <div className="flex justify-end mt-3">
                <button className="flex items-center text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-sm transition-colors">
                  <Scroll className="h-3 w-3 mr-1.5" />
                  View Full Reading
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <button onClick={handleReturnHome} className="mystical-button flex items-center justify-center mx-auto">
          <Moon className="h-4 w-4 mr-2 opacity-80" />
          Return to Sacred Portal
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="witch-card max-w-md w-full p-6 space-y-4 border border-white/20">
            <div className="text-center mb-2">
              <div className="w-12 h-12 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-white/70" />
                </div>
              </div>
              <h3 className="text-xl font-serif">Erase This Memory?</h3>
            </div>
            <p className="text-white/80 text-center">
              Are you certain you wish to remove this divination from the cosmic record? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button onClick={handleConfirmDelete} className="mystical-button bg-red-900/50 hover:bg-red-900/70">
                Yes, Erase This Memory
              </button>
              <button onClick={handleCancelDelete} className="mystical-button bg-opacity-50">
                No, Preserve It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
