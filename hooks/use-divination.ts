"use client"

import { useState, useCallback } from "react"
import { generateDivination, retryDivinationGeneration } from "@/actions/divination-actions"
import { HistoryService } from "@/services/history-service"
import type { DivinationFormData, TarotCard } from "@/types"

/**
 * Custom hook for managing divination state and actions
 * @returns Divination state and methods
 */
export function useDivination() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tarotCards, setTarotCards] = useState<TarotCard[]>([])
  const [reading, setReading] = useState<string | null>(null)
  const [isOpenAIError, setIsOpenAIError] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [resultSaved, setResultSaved] = useState(false)

  /**
   * Generate a divination reading
   * @param userData - User data from the form
   * @returns Success status
   */
  const generateReading = useCallback(async (userData: DivinationFormData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    setIsOpenAIError(false)

    try {
      const result = await generateDivination(userData)

      if (result.success && result.tarotCards) {
        setTarotCards(result.tarotCards)

        if (result.reading) {
          setReading(result.reading)
        }

        // Handle OpenAI error state if present
        if (result.openAIError) {
          setIsOpenAIError(true)
          setError(result.message || "Failed to connect to AI service")
        } else if (result.reading) {
          // Save successful result to history
          HistoryService.saveToHistory(userData, result)
          setResultSaved(true)
        }

        return true
      } else {
        setError(result.message || "Failed to generate divination")
        return false
      }
    } catch (error) {
      console.error("Error generating divination:", error)
      setError("An unexpected error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Retry generating a reading after an OpenAI error
   * @param userData - User data from the form
   * @returns Success status
   */
  const retryReading = useCallback(
    async (userData: DivinationFormData): Promise<boolean> => {
      setIsRetrying(true)
      setError(null)

      try {
        const result = await retryDivinationGeneration(userData)

        if (result.success) {
          if (result.reading) {
            setReading(result.reading)
            setIsOpenAIError(false)

            // Save successful retry to history
            if (!resultSaved && result.tarotCards) {
              HistoryService.saveToHistory(userData, result)
              setResultSaved(true)
            }

            return true
          } else if (result.openAIError) {
            setError(result.message || "Failed to connect to AI service")
            return false
          } else {
            setError(result.message || "Failed to generate divination")
            return false
          }
        } else {
          setError(result.message || "Failed to generate divination")
          return false
        }
      } catch (error) {
        console.error("Error retrying divination:", error)
        setError("An unexpected error occurred")
        return false
      } finally {
        setIsRetrying(false)
      }
    },
    [resultSaved],
  )

  return {
    isLoading,
    error,
    tarotCards,
    reading,
    isOpenAIError,
    isRetrying,
    generateReading,
    retryReading,
  }
}
