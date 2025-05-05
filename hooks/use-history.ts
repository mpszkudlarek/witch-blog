"use client"

import { useState, useEffect, useCallback } from "react"
import { HistoryService } from "@/services/history-service"
import type { DivinationHistoryItem } from "@/types"

/**
 * Custom hook for managing divination history
 * @returns History state and methods
 */
export function useHistory() {
  const [historyItems, setHistoryItems] = useState<DivinationHistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<DivinationHistoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load history from storage
   */
  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get history from local storage
      const history = HistoryService.getHistory()
      setHistoryItems(history)

      // Try to synchronize with backend
      await HistoryService.synchronizeHistory()

      // Reload after synchronization
      const updatedHistory = HistoryService.getHistory()
      setHistoryItems(updatedHistory)
    } catch (error) {
      console.error("Error loading history:", error)
      setError("Failed to load history")
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Delete a history item
   * @param id - ID of the item to delete
   */
  const deleteHistoryItem = useCallback(
    async (id: string) => {
      try {
        await HistoryService.deleteHistoryItem(id)
        setHistoryItems((prev) => prev.filter((item) => item.id !== id))

        // If the deleted item is currently selected, clear selection
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(null)
        }
      } catch (error) {
        console.error("Error deleting history item:", error)
        setError("Failed to delete history item")
      }
    },
    [selectedItem],
  )

  /**
   * Clear all history
   */
  const clearHistory = useCallback(async () => {
    try {
      await HistoryService.clearHistory()
      setHistoryItems([])
      setSelectedItem(null)
    } catch (error) {
      console.error("Error clearing history:", error)
      setError("Failed to clear history")
    }
  }, [])

  // Load history on mount
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return {
    historyItems,
    selectedItem,
    isLoading,
    error,
    setSelectedItem,
    deleteHistoryItem,
    clearHistory,
    refreshHistory: loadHistory,
  }
}
