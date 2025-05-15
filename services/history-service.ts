import type { DivinationHistoryItem, DivinationResult, DivinationFormData } from "@/types"

/**
 * HistoryService provides methods for managing divination history in local storage
 * This is a simplified implementation that will be replaced with real backend calls later
 */
export const HistoryService = {
  /**
   * Save a divination result to history
   * @param userData - The user data from the form
   * @param result - The divination result
   */
  saveToHistory: (userData: DivinationFormData, result: DivinationResult): void => {
    if (typeof window === "undefined" || !result.success || !result.tarotCards) {
      return
    }

    try {
      // Create new history item
      const newItem: DivinationHistoryItem = {
        id: `divination-${Date.now()}`,
        date: new Date().toISOString(),
        userData,
        tarotCards: result.tarotCards,
        reading: result.reading || "No reading available",
      }

      // Get existing history or initialize empty array
      const existingHistory = HistoryService.getHistory()

      // Add to beginning of array (most recent first)
      const updatedHistory = [newItem, ...existingHistory]

      // Limit history to 10 items to prevent local storage from getting too full
      const limitedHistory = updatedHistory.slice(0, 10)

      // Save to local storage
      localStorage.setItem("divination-history", JSON.stringify(limitedHistory))
    } catch (error) {
      console.error("Error saving to history:", error)
    }
  },

  /**
   * Get the user's divination history
   * @returns Array of divination history items
   */
  getHistory: (): DivinationHistoryItem[] => {
    if (typeof window === "undefined") {
      return []
    }

    try {
      const historyJson = localStorage.getItem("divination-history")
      if (!historyJson) {
        return []
      }

      return JSON.parse(historyJson) as DivinationHistoryItem[]
    } catch (error) {
      console.error("Error retrieving history:", error)
      return []
    }
  },

  /**
   * Delete a specific history item
   * @param id - The ID of the history item to delete
   */
  deleteHistoryItem: (id: string): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      // Get existing history
      const history = HistoryService.getHistory()

      // Filter out the item to delete
      const updatedHistory = history.filter((item) => item.id !== id)

      // Save updated history to local storage
      localStorage.setItem("divination-history", JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Error deleting history item:", error)
    }
  },

  /**
   * Clear all divination history
   */
  clearHistory: (): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      // Clear local storage
      localStorage.removeItem("divination-history")
    } catch (error) {
      console.error("Error clearing history:", error)
    }
  },
}
