import type { Metadata } from "next"
import DivinationHistory from "@/components/divination-history"
import { Moon, Star, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "Your Divination History | Witch Blog",
  description: "Review your past divination readings and spiritual insights",
}

export default function HistoryPage() {
  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Moon className="h-6 w-6 mr-2 opacity-80" />
            <h1 className="text-3xl font-serif">Your Divination History</h1>
            <Star className="h-6 w-6 ml-2 opacity-80" />
          </div>
          <div className="w-16 h-1 bg-white/30 mx-auto mb-4"></div>
          <p className="text-sm opacity-70 italic font-serif tracking-wide">
            The echoes of your past readings remain in the cosmic memory
          </p>

          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center px-3 py-1.5 bg-white/5 rounded-sm">
              <BookOpen className="h-4 w-4 mr-2 opacity-70" />
              <span className="text-sm opacity-80">Your personal archive of mystical insights</span>
            </div>
          </div>
        </div>

        <DivinationHistory />
      </div>
    </main>
  )
}
