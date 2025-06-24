"use client"

import {Suspense} from "react"
import BlikPaymentForm from "@/components/blik-payment-form"

export default function PaymentClient() {
    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif mb-2">Complete Your Offering</h1>
                    <p className="text-sm opacity-70">Your divination awaits beyond the veil</p>
                </div>

                <Suspense fallback={<div className="text-center text-sm text-white/70">Loading payment form...</div>}>
                    <BlikPaymentForm/>
                </Suspense>
            </div>
        </main>
    )
}
