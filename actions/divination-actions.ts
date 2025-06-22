"use server"

import type { DivinationFormData, PaymentResult, BlikPaymentParams } from "@/types"

/**
 * Submit the divination form data
 */
export async function submitDivinationForm(data: DivinationFormData) {
  try {
    if (
        !data.name ||
        !data.dateOfBirth ||
        !data.favoriteColor ||
        !data.favoriteNumber ||
        !data.relationshipStatus
    ) {
      return { success: false, message: "All fields are required" }
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    return { success: true, message: "Form submitted successfully" }
  } catch (error) {
    console.error("Error in submitDivinationForm:", error)
    return { success: false, message: "An error occurred" }
  }
}

/**
 * Stub function for processPayment (not used directly anymore)
 * This is left only for compatibility — real processing is via WebSocket
 */
export async function processPayment(blikCode: string): Promise<PaymentResult> {
  return {
    success: false,
    message: "Payment is now handled via WebSocket. This endpoint is deprecated.",
  }
}
