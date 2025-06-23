"use client"

import {useState, useEffect} from "react"
import {X} from "lucide-react"

interface PaymentAnimationProps {
    hasError?: boolean
}

export default function PaymentAnimation({hasError = false}: PaymentAnimationProps) {
    const [step, setStep] = useState(1)
    const [showErrorMessage, setShowErrorMessage] = useState(false)

    useEffect(() => {
        const timer1 = setTimeout(() => setStep(2), 2000)

        const timer2 = setTimeout(() => setStep(3), 4000)

        const timer3 = setTimeout(() => {
            if (hasError) {
                setShowErrorMessage(true)
            }
        }, 6000)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
        }
    }, [hasError])

    return (
        <div className="py-8 px-4">
            <div className="flex flex-col items-center justify-center space-y-8">
                <div className="blik-animation">
                    <div className="h-full flex items-center justify-center">
                        <p className="text-lg font-medium">Processing BLIK Payment</p>
                    </div>
                </div>

                <div className="space-y-4 w-full">
                    {/* Step 1: Verifying code */}
                    <div className="flex items-center">
                        <div
                            className={`w-5 h-5 rounded-full mr-3 ${step >= 1 ? "bg-white" : "bg-gray-700"} transition-colors duration-700`}
                        ></div>
                        <p className={`${step >= 1 ? "opacity-100" : "opacity-50"} transition-opacity duration-700`}>
                            Verifying code
                        </p>
                    </div>

                    <div className="flex items-center">
                        <div
                            className={`w-5 h-5 rounded-full mr-3 ${step >= 2 ? "bg-white" : "bg-gray-700"} transition-colors duration-700`}
                        ></div>
                        <p className={`${step >= 2 ? "opacity-100" : "opacity-50"} transition-opacity duration-700`}>
                            Processing payment
                        </p>
                    </div>

                    <div className="flex items-center">
                        {hasError && step >= 3 ? (
                            <div className="w-5 h-5 rounded-full mr-3 flex items-center justify-center bg-red-500">
                                <X size={12} className="text-white"/>
                            </div>
                        ) : (
                            <div
                                className={`w-5 h-5 rounded-full mr-3 ${step >= 3 ? "bg-white" : "bg-gray-700"} transition-colors duration-700`}
                            ></div>
                        )}
                        <p
                            className={`${step >= 3 ? "opacity-100" : "opacity-50"} transition-opacity duration-700 ${hasError && step >= 3 ? "text-red-400" : ""}`}
                        >
                            Contacting the Ethereal Treasury
                        </p>
                    </div>
                </div>

                {hasError && step >= 3 && (
                    <div className="payment-error-icon w-8 h-8 bg-red-500/20">
                        <X size={16} className="text-red-500"/>
                    </div>
                )}

                <p
                    className={`text-sm ${hasError && step >= 3 ? "text-red-400" : "opacity-70"} text-center transition-all duration-1000`}
                >
                    {showErrorMessage && "The Veil Has Thickened. The ethereal pathways are obscured."}
                    {!showErrorMessage && !hasError && step === 1 && "Connecting to the spiritual realm..."}
                    {!showErrorMessage && !hasError && step === 2 && "The mystical energies are aligning..."}
                    {!showErrorMessage && !hasError && step === 3 && "Awaiting approval from the cosmic guardians..."}
                    {!showErrorMessage && hasError && step === 3 && "Encountering resistance in the ethereal plane..."}
                    {!showErrorMessage &&
                        hasError &&
                        step < 3 &&
                        (step === 1 ? "Connecting to the spiritual realm..." : "The mystical energies are aligning...")}
                </p>
            </div>
        </div>
    )
}
