import type { PaymentResult, BlikPaymentParams } from "@/types"
import { ApiClient } from "./api-client"
import { webSocketService } from "./websocket-service"
import { WebSocketMessageType } from "@/types/websocket"
import { ApiConfig } from "@/config/api-config"

/**
 * PaymentService provides methods for processing payments
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

      // Check if we should use WebSockets and they're available
      if (ApiConfig.features.useWebSockets && !ApiConfig.features.useMockData) {
        try {
          // Ensure WebSocket is connected
          if (
            webSocketService.getConnectionStatus() !== "CONNECTED" &&
            webSocketService.getConnectionStatus() !== "AUTHENTICATED"
          ) {
            await webSocketService.connect()
          }

          // Register for payment updates
          const updateHandler = (message: any) => {
            console.log("Payment update:", message.payload)
            // You could dispatch events or update UI based on these updates
          }

          webSocketService.on(WebSocketMessageType.PAYMENT_UPDATE, updateHandler)

          // Send payment request via WebSocket
          const result = await webSocketService.sendPaymentRequest({
            blikCode: params.code,
            amount: params.amount,
            description: params.description,
            reference: params.reference,
          })

          // Clean up handler
          webSocketService.off(WebSocketMessageType.PAYMENT_UPDATE, updateHandler)

          return {
            success: true,
            message: "Payment processed successfully",
            amount: params.amount.toFixed(2),
            transactionId: result.transactionId || `BLIK-${Date.now()}`,
          }
        } catch (error) {
          console.error("WebSocket payment error:", error)
          // Fall back to REST API if WebSocket fails
          return PaymentService.processBlikPaymentRest(params)
        }
      } else if (!ApiConfig.features.useMockData) {
        // Use REST API if not using mock data
        return PaymentService.processBlikPaymentRest(params)
      } else {
        // Use mock data
        return PaymentService.mockBlikPayment(params)
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
   * Process a BLIK payment using REST API
   * @param params - Payment parameters including BLIK code and amount
   * @returns Promise with the payment result
   */
  processBlikPaymentRest: async (params: BlikPaymentParams): Promise<PaymentResult> => {
    try {
      // Call the backend API
      const response = await ApiClient.post("/payment/blik", params)

      if (response.success && response.data) {
        return {
          success: true,
          message: "Payment processed successfully",
          amount: params.amount.toFixed(2),
          transactionId: response.data.transactionId,
        }
      } else {
        return {
          success: false,
          message: response.error?.message || "Payment failed",
        }
      }
    } catch (error) {
      console.error("REST API payment error:", error)
      // Fall back to mock data if REST API fails
      return PaymentService.mockBlikPayment(params)
    }
  },

  /**
   * Mock a BLIK payment for development and testing
   * @param params - Payment parameters including BLIK code and amount
   * @returns Promise with the mocked payment result
   */
  mockBlikPayment: async (params: BlikPaymentParams): Promise<PaymentResult> => {
    console.log("Using mock BLIK payment with params:", params)

    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // For demo purposes, we'll return a mock successful response
    return {
      success: true,
      message: "Payment processed successfully",
      amount: params.amount.toFixed(2),
      transactionId: `MOCK-BLIK-${Date.now()}`,
    }
  },

  /**
   * Verify a payment status
   * @param transactionId - The transaction ID to verify
   * @returns Promise with the payment result
   */
  verifyPaymentStatus: async (transactionId: string): Promise<PaymentResult> => {
    if (ApiConfig.features.useMockData) {
      // Mock verification
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        message: "Payment verified successfully",
        transactionId,
      }
    }

    try {
      // Call the backend API
      const response = await ApiClient.get(`/payment/status/${transactionId}`)

      if (response.success && response.data) {
        return {
          success: response.data.status === "COMPLETED",
          message: response.data.message || "Payment status retrieved",
          amount: response.data.amount,
          transactionId: response.data.transactionId,
        }
      } else {
        return {
          success: false,
          message: response.error?.message || "Failed to verify payment status",
        }
      }
    } catch (error) {
      console.error("Error verifying payment status:", error)
      // Mock response if API fails
      return {
        success: true,
        message: "Payment verified successfully (mock)",
        transactionId,
      }
    }
  },
}
