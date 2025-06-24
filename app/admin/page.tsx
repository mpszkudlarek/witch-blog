import type {Metadata} from "next"
import MysticLedger from "@/components/mystic-ledger"
import {Moon, Star} from "lucide-react"

export const metadata: Metadata = {
    title: "Mystic Ledger | Witch Blog Admin",
    description: "Administrative dashboard for divination analytics and revenue tracking",
}

export default function AdminPage() {
    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-6xl w-full mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Moon className="h-6 w-6 mr-2 opacity-80"/>
                        <h1 className="text-3xl font-serif">Mystic Ledger</h1>
                        <Star className="h-6 w-6 ml-2 opacity-80"/>
                    </div>
                    <div className="w-16 h-1 bg-white/30 mx-auto mb-4"></div>
                    <p className="text-sm opacity-70 italic font-serif tracking-wide">
                        The sacred records of cosmic commerce and ethereal exchanges
                    </p>

                </div>

                <MysticLedger/>
            </div>
        </main>
    )
}
