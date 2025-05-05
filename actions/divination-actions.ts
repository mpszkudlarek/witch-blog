"use server"

import { revalidatePath } from "next/cache"
import { DivinationService } from "@/services/divination-service"
import { PaymentService } from "@/services/payment-service"
import type { DivinationFormData, PaymentResult, DivinationResult, BlikPaymentParams } from "@/types"

/**
 * Submit the divination form data
 *
 * This server action validates and processes the initial form submission
 * before redirecting to the payment page.
 *
 * @param data - User input data from the divination form
 * @returns Result of the form submission with success status and message
 */
export async function submitDivinationForm(data: DivinationFormData) {
  try {
    // Validate the data
    if (!data.name || !data.dateOfBirth || !data.favoriteColor || !data.favoriteNumber || !data.relationshipStatus) {
      return { success: false, message: "All fields are required" }
    }

    // In a real app, you might store this in a database
    // For now, we'll just return success

    // Add artificial delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true, message: "Form submitted successfully" }
  } catch (error) {
    console.error("Error in submitDivinationForm:", error)
    return { success: false, message: "An error occurred" }
  }
}

/**
 * Process a BLIK payment
 *
 * This server action handles the payment processing via BLIK.
 * It will be adapted to use WebSockets when ready.
 *
 * @param blikCode - The 6-digit BLIK code
 * @returns Payment result with success status and transaction details
 */
export async function processPayment(blikCode: string): Promise<PaymentResult> {
  try {
    // Validate BLIK code (should be 6 digits)
    if (!/^\d{6}$/.test(blikCode)) {
      return { success: false, message: "Invalid BLIK code" }
    }

    // Fixed cost for a single divination
    const finalCost = 15

    // Prepare payment parameters
    const paymentParams: BlikPaymentParams = {
      code: blikCode,
      amount: finalCost,
      description: `Witch Blog Divination Reading`,
    }

    try {
      // Process the payment using the PaymentService
      const paymentResult = await PaymentService.processBlikPayment(paymentParams)

      // Handle the response
      if (paymentResult.success) {
        revalidatePath("/divination")
        return paymentResult
      } else {
        return paymentResult
      }
    } catch (error) {
      console.error("Payment service error:", error)
      return { success: false, message: "Payment service unavailable" }
    }
  } catch (error) {
    console.error("Error in processPayment:", error)
    return { success: false, message: "Payment failed" }
  }
}

/**
 * Generate a divination reading
 *
 * This server action generates a tarot card reading based on user data.
 * It will be adapted to use WebSockets when ready.
 *
 * @param userData - User input data from the divination form
 * @returns Generated divination including tarot cards and reading
 */
export async function generateDivination(userData: DivinationFormData): Promise<DivinationResult> {
  try {
    // Use the DivinationService to generate the reading
    return await DivinationService.generateDivination(userData)
  } catch (error) {
    console.error("Error in generateDivination:", error)
    return { success: false, message: "Failed to generate divination" }
  }
}

/**
 * Retry generating a divination after an OpenAI error
 *
 * This server action allows users to retry the AI generation if it failed initially.
 *
 * @param userData - User input data from the divination form
 * @returns Generated divination including tarot cards and reading
 */
export async function retryDivinationGeneration(userData: DivinationFormData): Promise<DivinationResult> {
  // Clear the OpenAI error flag
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("openai_error")
  }

  // Call the regular generation function
  return generateDivination(userData)
}
