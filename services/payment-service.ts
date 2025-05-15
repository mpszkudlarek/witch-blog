import type { PaymentResult, BlikPaymentParams } from "@/types"

/**
 * PaymentService provides methods for processing payments
 * This is a simplified mock implementation that will be replaced with real backend calls later
 */
export const PaymentService = {
  /**
   * Process a BLIK payment
   * @param params - Payment parameters including BLIK code and amount
   * @returns Promise with the payment result
   */
  processBlikPayment: async (params: BlikPaymentParams): Promise<PaymentResult> => {
    try {
      // Special test cases for demonstration purposes
      if (params.code === "123456") {
        return {
          success: false,
          message: "BLIK connection error. The payment service is currently unavailable.",
          connectionError: true,
        }
      }

      // Test case: OpenAI error flag
      if (params.code === "123455") {
        // Store a flag in session storage to trigger OpenAI error later
        if (typeof window !== "undefined") {
          sessionStorage.setItem("openai_error", "true")
        }

        return {
          success: true,
          message: "Payment successful",
          amount: params.amount.toFixed(2),
          transactionId: `BLIK-${Date.now()}`,
        }
      }

      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For demo purposes, return a mock successful response
      return {
        success: true,
        message: "Payment processed successfully",
        amount: params.amount.toFixed(2),
        transactionId: `MOCK-BLIK-${Date.now()}`,
      }
    } catch (error) {
      console.error("Error in processBlikPayment:", error)
      return {
        success: false,
        message: "An unexpected error occurred during payment processing",
      }
    }
  },

  /**
   * Verify a payment status
   * @param transactionId - The transaction ID to verify
   * @returns Promise with the payment result
   */
  verifyPaymentStatus: async (transactionId: string): Promise<PaymentResult> => {
    // Mock verification
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      success: true,
      message: "Payment verified successfully",
      transactionId,
    }
  },
}
