// hooks/use-payment.ts

import { useState } from "react"
import { sendBlikPayment } from "@/services/payment-service"

interface UsePaymentResult {
    isLoading: boolean
    error: string | null
    processPayment: (args: {
        userId: string
        processId: string
        blikCode: string
    }) => Promise<void>
}

export function usePayment(): UsePaymentResult {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const processPayment = async ({
                                      userId,
                                      processId,
                                      blikCode,
                                  }: {
        userId: string
        processId: string
        blikCode: string
    }) => {
        setIsLoading(true)
        setError(null)

        try {
            await sendBlikPayment({
                userId,
                processId,
                BLIKCode: blikCode,
            })
        } catch (err: unknown) {
            console.error("Payment error:", err)

            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError("Payment request failed")
            }
        } finally {
            setIsLoading(false)
        }

    }

    return { isLoading, error, processPayment }
}
