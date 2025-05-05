import type { DivinationHistoryItem, DivinationResult, DivinationFormData } from "@/types"
import { ApiClient } from "./api-client"
import { ApiConfig } from "@/config/api-config"

/**
 * HistoryService provides methods for managing divination history
 */
export const HistoryService = {
  /**
   * Save a divination result to history
   * @param userData - The user data from the form
   * @param result - The divination result
   */
  saveToHistory: async (userData: DivinationFormData, result: DivinationResult): void => {
    if (typeof window === "undefined" || !result.success || !result.tarotCards || !result.reading) {
      return
    }

    try {
      // Create new history item
      const newItem: DivinationHistoryItem = {
        id: `divination-${Date.now()}`,
        date: new Date().toISOString(),
        userData,
        tarotCards: result.tarotCards,
        reading: result.reading,
      }

      // Save to local storage
      HistoryService.saveToLocalStorage(newItem)

      // Attempt to sync with backend if not in mock mode and backend is available
      if (!ApiConfig.features.useMockData) {
        HistoryService.syncWithBackend(newItem).catch((error) => {
          console.error("Error syncing history with backend:", error)
        })
      }
    } catch (error) {
      console.error("Error saving to history:", error)
    }
  },

  /**
   * Save a history item to local storage
   * @param item - The history item to save
   */
  saveToLocalStorage: (item: DivinationHistoryItem): void => {
    try {
      // Get existing history or initialize empty array
      const existingHistory = HistoryService.getHistory()

      // Add to beginning of array (most recent first)
      const updatedHistory = [item, ...existingHistory]

      // Limit history to 10 items to prevent local storage from getting too full
      const limitedHistory = updatedHistory.slice(0, 10)

      // Save to local storage
      localStorage.setItem("divination-history", JSON.stringify(limitedHistory))
    } catch (error) {
      console.error("Error saving to local storage:", error)
    }
  },

  /**
   * Sync a history item with the backend
   * @param item - The history item to sync
   */
  syncWithBackend: async (item: DivinationHistoryItem): Promise<void> => {
    try {
      // Call the backend API
      await ApiClient.post("/history", item)
    } catch (error) {
      console.error("Error syncing with backend:", error)
      // Store failed syncs for later retry
      HistoryService.storeFailedSync(item)
    }
  },

  /**
   * Store a failed sync for later retry
   * @param item - The history item that failed to sync
   */
  storeFailedSync: (item: DivinationHistoryItem): void => {
    try {
      // Get existing failed syncs or initialize empty array
      const failedSyncs = JSON.parse(localStorage.getItem("failed-syncs") || "[]")

      // Add to array
      failedSyncs.push(item)

      // Save to local storage
      localStorage.setItem("failed-syncs", JSON.stringify(failedSyncs))
    } catch (error) {
      console.error("Error storing failed sync:", error)
    }
  },

  /**
   * Retry failed syncs
   */
  retryFailedSyncs: async (): Promise<void> => {
    try {
      // Get failed syncs
      const failedSyncs = JSON.parse(localStorage.getItem("failed-syncs") || "[]")

      if (failedSyncs.length === 0) {
        return
      }

      // Create a copy of the array
      const syncsToRetry = [...failedSyncs]

      // Clear failed syncs
      localStorage.setItem("failed-syncs", "[]")

      // Retry each sync
      for (const item of syncsToRetry) {
        try {
          await HistoryService.syncWithBackend(item)
        } catch (error) {
          // If still failing, store for later retry
          HistoryService.storeFailedSync(item)
        }
      }
    } catch (error) {
      console.error("Error retrying failed syncs:", error)
    }
  },

  /**
   * Get the user  {
      console.error("Error retrying failed syncs:", error)
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
   * Fetch history from the backend
   * @param page - Page number for pagination
   * @param size - Number of items per page
   * @returns Promise with the history items
   */
  fetchHistoryFromBackend: async (page = 0, size = 10): Promise<DivinationHistoryItem[]> => {
    if (ApiConfig.features.useMockData) {
      // Return local history if using mock data
      return HistoryService.getHistory()
    }

    try {
      // Call the backend API
      const response = await ApiClient.get("/history", { page: page.toString(), size: size.toString() })

      if (response.success && response.data) {
        return response.data.items
      } else {
        console.error("Error fetching history from backend:", response.error)
        return []
      }
    } catch (error) {
      console.error("Error fetching history from backend:", error)
      return []
    }
  },

  /**
   * Merge local and backend history
   * @param localHistory - History from local storage
   * @param backendHistory - History from backend
   * @returns Merged history items
   */
  mergeHistory: (
    localHistory: DivinationHistoryItem[],
    backendHistory: DivinationHistoryItem[],
  ): DivinationHistoryItem[] => {
    // Create a map of existing IDs
    const idMap = new Map<string, boolean>()
    const mergedHistory: DivinationHistoryItem[] = []

    // Add local history items
    for (const item of localHistory) {
      idMap.set(item.id, true)
      mergedHistory.push(item)
    }

    // Add backend history items that don't exist locally
    for (const item of backendHistory) {
      if (!idMap.has(item.id)) {
        mergedHistory.push(item)
      }
    }

    // Sort by date (most recent first)
    mergedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return mergedHistory
  },

  /**
   * Synchronize local history with backend
   */
  synchronizeHistory: async (): Promise<void> => {
    if (ApiConfig.features.useMockData) {
      // Skip synchronization if using mock data
      return
    }

    try {
      // Get local history
      const localHistory = HistoryService.getHistory()

      // Fetch backend history
      const backendHistory = await HistoryService.fetchHistoryFromBackend()

      // Merge histories
      const mergedHistory = HistoryService.mergeHistory(localHistory, backendHistory)

      // Save merged history to local storage
      localStorage.setItem("divination-history", JSON.stringify(mergedHistory))

      // Retry failed syncs
      await HistoryService.retryFailedSyncs()
    } catch (error) {
      console.error("Error synchronizing history:", error)
    }
  },

  /**
   * Delete a specific history item
   * @param id - The ID of the history item to delete
   */
  deleteHistoryItem: async (id: string): Promise<void> => {
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

      // Delete from backend if not in mock mode
      if (!ApiConfig.features.useMockData) {
        try {
          await ApiClient.delete(`/history/${id}`)
        } catch (error) {
          console.error("Error deleting history item from backend:", error)
        }
      }
    } catch (error) {
      console.error("Error deleting history item:", error)
    }
  },

  /**
   * Clear all divination history
   */
  clearHistory: async (): Promise<void> => {
    if (typeof window === "undefined") {
      return
    }

    try {
      // Clear local storage
      localStorage.removeItem("divination-history")

      // Clear from backend if not in mock mode
      if (!ApiConfig.features.useMockData) {
        try {
          await ApiClient.delete("/history/all")
        } catch (error) {
          console.error("Error clearing history from backend:", error)
        }
      }
    } catch (error) {
      console.error("Error clearing history:", error)
    }
  },
}
