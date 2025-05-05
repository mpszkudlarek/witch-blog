import type { Metadata } from "next"
import DivinationResults from "@/components/divination-results"
import { Moon, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Your Divination | Witch Blog",
  description: "Discover what the cards reveal about your future",
}

export default function DivinationPage() {
  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Moon className="h-6 w-6 mr-2 opacity-80" />
            <h1 className="text-3xl font-serif">Your Divination</h1>
            <Star className="h-6 w-6 ml-2 opacity-80" />
          </div>
          <div className="w-16 h-1 bg-white/30 mx-auto mb-4"></div>
          <p className="text-sm opacity-70 italic font-serif tracking-wide">
            The veil has been lifted, revealing the whispers of your destiny
          </p>
        </div>

        <DivinationResults />
      </div>
    </main>
  )
}
