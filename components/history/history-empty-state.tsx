import { Moon, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EmptyState() {
    const router = useRouter()
    return (
        <div className="witch-card bg-black/50 text-center p-8">
            <div className="mb-8">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-white/50" />
                    </div>
                </div>

                <h3 className="text-2xl font-serif mb-4">The Cosmic Scroll Awaits</h3>
                <p className="text-white/80 font-light max-w-md mx-auto">
                    Your journey through the mystical realms has yet to begin. When you receive your first divination, it will be recorded here in the cosmic memory.
                </p>
            </div>
            <button onClick={() => router.push("/")} className="mystical-button flex items-center justify-center mx-auto">
                <Moon className="h-4 w-4 mr-2 opacity-80" />
                Return to Sacred Portal
            </button>
        </div>
    )
}
