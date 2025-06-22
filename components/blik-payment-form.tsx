"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Moon, Sparkles } from "lucide-react"
import PaymentAnimation from "./payment-animation"
import { useStomp } from "@/hooks/useStomp"
import type { DivinationFormData } from "@/types"

export default function BlikPaymentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const userId = searchParams.get("userId") || ""
  const processId = searchParams.get("processId") || ""

  const [blikCode, setBlikCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [divinationData, setDivinationData] = useState<DivinationFormData | null>(null)
  const [isConnectionError, setIsConnectionError] = useState(false)
  const [isPaymentError, setIsPaymentError] = useState(false)

  useEffect(() => {
    const storedData = sessionStorage.getItem("divinationData")
    if (storedData) {
      try {
        setDivinationData(JSON.parse(storedData))
      } catch (e) {
        console.error("Error parsing stored divination data:", e)
        setError("Invalid session data. Please return to the form.")
      }
    }
  }, [])

  // STOMP WebSocket logic
  useStomp(userId, processId, (event) => {
    if (
        typeof event === "object" &&
        event !== null &&
        (event as any).type?.type === "payment.completed"
    ) {
      const paymentInfo = event as {
        type: { type: string }
        state: string
        message: string
      }

      if (paymentInfo.state === "PAYMENT_SUCCEEDED") {
        setTimeout(() => {
          router.push("/divination")
        }, 3000)
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsConnectionError(false)
    setIsPaymentError(false)

    if (!/^\d{6}$/.test(blikCode)) {
      setError("Please enter a valid 6-digit BLIK code")
      return
    }

    setIsProcessing(true)

    try {
      const ws = new WebSocket(
          `ws://localhost:8083/ws?userId=${userId}&processId=${processId}`
      )
      ws.onopen = () => {
        const msg = {
          code: blikCode,
          amount: 15,
          description: "Witch Blog Divination Reading",
        }
        ws.send(
            JSON.stringify({
              destination: "/app/pay",
              payload: msg,
            })
        )
      }
    } catch (err) {
      console.error("WebSocket error:", err)
      setError("Could not connect to the server")
      setIsProcessing(false)
    }
  }

  if (!divinationData) {
    return (
        <div className="witch-card bg-black/50 backdrop-blur-sm text-center p-6">
          <p>No divination data found. Please return to the home page.</p>
          <button onClick={() => router.push("/")} className="mystical-button mt-4">
            Return Home
          </button>
        </div>
    )
  }

  const finalCost = 15

  return (
      <div className="witch-card bg-black/50 backdrop-blur-sm">
        {isProcessing && !isConnectionError ? (
            <PaymentAnimation hasError={isPaymentError} />
        ) : isConnectionError ? (
            <div className="text-center p-6 space-y-6">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full bg-slate-900 border border-white/20"></div>
                  <div className="absolute inset-2 rounded-full bg-slate-800 flex items-center justify-center">
                    <Moon className="h-6 w-6 text-white/70" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-serif mb-3">The Veil Has Thickened</h3>
                <p className="text-white/80 font-light">
                  The ethereal pathways between realms are obscured. Try again later.
                </p>
              </div>
              <button onClick={() => router.back()} className="mystical-button">
                Return to the Sacred Circle
              </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-6 p-4 border border-white/10 rounded-sm">
                <div className="flex justify-between items-center text-lg font-medium">
                  <span>Total:</span>
                  <span>${finalCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="blikCode" className="witch-label">
                    BLIK Code
                  </label>
                  <input
                      type="text"
                      id="blikCode"
                      value={blikCode}
                      onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="witch-input text-center text-2xl tracking-widest"
                      placeholder="______"
                      maxLength={6}
                      pattern="\d{6}"
                      required
                  />
                  <p className="text-xs text-center mt-2 opacity-70">
                    Enter the 6-digit code from your banking app
                  </p>
                </div>
                {error && <div className="text-red-400 text-sm text-center">{error}</div>}
              </div>

              <div className="pt-4">
                <button type="submit" className="mystical-button w-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Complete Payment
                </button>
              </div>

              <div className="text-center text-xs opacity-70 pt-2">
                <p>
                  By proceeding, you agree to our{" "}
                  <a
                      href="https://www.facebook.com/profile.php?id=100091842926056"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link underline hover:text-white transition-colors"
                  >
                    terms and conditions
                  </a>
                </p>
              </div>
            </form>
        )}
      </div>
  )
}
