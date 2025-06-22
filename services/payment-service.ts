// services/payment-service.ts

interface PaymentRequest {
    userId: string
    processId: string
    BLIKCode: string
}

export async function sendBlikPayment(request: PaymentRequest): Promise<Response> {
    const response = await fetch("http://localhost:8080/payment-service/blik", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        throw new Error(`Failed to process BLIK payment: ${response.statusText}`)
    }

    return response
}
