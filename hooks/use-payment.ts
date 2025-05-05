"use client"

import { useState, useCallback } from "react"
import { processPayment } from "@/actions/divination-actions"
import type { PaymentResult } from "@/types"

/**
 * Custom hook for managing payment state and actions
 * @returns Payment state and methods
 */
export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnectionError, setIsConnectionError] = useState(false)
  const [isPaymentError, setIsPaymentError] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  /**
   * Process a BLIK payment
   * @param blikCode - The 6-digit BLIK code
   * @returns Payment result
   */
  const processBlikPayment = useCallback(async (blikCode: string): Promise<PaymentResult> => {
    setIsProcessing(true)
    setError(null)
    setIsConnectionError(false)
    setIsPaymentError(false)

    try {
      // Process the payment using the server action
      const result = await processPayment(blikCode)

      if (result.success) {
        // Store transaction ID if available
        if (result.transactionId) {
          setTransactionId(result.transactionId)
          sessionStorage.setItem("transactionId", result.transactionId)
        }

        return result
      } else {
        // Check if it's a connection error
        if (result.connectionError) {
          setIsPaymentError(true)
          setIsConnectionError(true)
        } else {
          setIsPaymentError(true)
          setError(result.message || "Payment failed")
        }

        return result
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      setError("An unexpected error occurred")
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    } finally {
      // Note: We don't set isProcessing to false here because
      // the component using this hook should handle the timing
      // of when to hide the processing UI
    }
  }, [])

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setIsProcessing(false)
    setError(null)
    setIsConnectionError(false)
    setIsPaymentError(false)
  }, [])

  return {
    isProcessing,
    error,
    isConnectionError,
    isPaymentError,
    transactionId,
    processBlikPayment,
    resetPayment,
  }
}
