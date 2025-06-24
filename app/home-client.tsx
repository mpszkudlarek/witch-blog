"use client"

import Link from "next/link"
import {useRouter} from "next/navigation"
import DivinationForm from "@/components/divination-form"
import {Moon, Star, BookOpen, UserCog} from "lucide-react"

export default function HomeClient() {
    useRouter();
    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Moon className="h-6 w-6 mr-2 opacity-80"/>
                        <h1 className="text-3xl font-serif">Witchblog 2.0</h1>
                        <Star className="h-6 w-6 ml-2 opacity-80"/>
                    </div>
                    <div className="w-16 h-1 bg-white/30 mx-auto mb-4"></div>
                    <p className="text-sm opacity-70 italic">
                        Unveil the mysteries that lie beyond the veil
                    </p>
                </div>

                <DivinationForm/>

                <div className="mt-6 flex flex-col items-center space-y-2 text-sm">
                    <Link
                        href="/history"
                        className="inline-flex items-center opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <BookOpen className="h-4 w-4 mr-2"/>
                        Reveal Past Visions
                    </Link>

                    <Link
                        href="/admin"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <UserCog className="h-4 w-4 mr-2"/>
                        Mystic Ledger
                    </Link>
                </div>
            </div>
        </main>
    )
}
