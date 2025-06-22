"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import DivinationForm from "@/components/divination-form"
import { Moon, Star, BookOpen } from "lucide-react"

export default function HomeClient() {
    const router = useRouter()

    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full mx-auto">
                {/* Nagłówek i intro */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Moon className="h-6 w-6 mr-2 opacity-80" />
                        <h1 className="text-3xl font-serif">The Witch&#39;s Divination</h1>
                        <Star className="h-6 w-6 ml-2 opacity-80" />
                    </div>
                    <div className="w-16 h-1 bg-white/30 mx-auto mb-4"></div>
                    <p className="text-sm opacity-70 italic">
                        Unveil the mysteries that lie beyond the veil
                    </p>
                </div>

                {/* Formularz wróżby */}
                <DivinationForm />

                {/* Link do historii (można ukryć na później) */}
                <div className="mt-6 text-center">
                    <Link
                        href="/history"
                        className="inline-flex items-center text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Your Reading History
                    </Link>
                </div>
            </div>
        </main>
    )
}
