"use client"

import React, {useCallback, useEffect, useState} from "react"
import {AdminService} from "@/services/admin-service"
import {
    Calendar,
    TrendingUp,
    Coins,
    Zap,
    AlertCircle,
    Moon,
    Filter,
    Shield,
} from "lucide-react"
import type {AdminSummary} from "@/types/admin"
import CustomDatePicker from "./custom-date-picker"

export default function LedgerView({
                                       password,
                                       onExitAction,
                                   }: {
    password: string
    onExitAction: () => void
}) {
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        return date.toISOString().split("T")[0]
    })

    const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0])
    const [summary, setSummary] = useState<AdminSummary | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchInitialSummary = useCallback(async () => {
        const start = Date.now()
        setIsLoading(true)
        setError(null)

        try {
            const data = await AdminService.getAdminSummary(password)
            const elapsed = Date.now() - start
            const delay = Math.max(0, 2000 - elapsed)

            setTimeout(() => {
                setSummary(data)
                setIsLoading(false)
            }, delay)
        } catch (err) {
            console.error("Error fetching admin summary:", err)
            setError("Failed to load mystic ledger data.")
            setIsLoading(false)
        }
    }, [password])

    const fetchFilteredSummary = async () => {
        const start = Date.now()
        setIsLoading(true)
        setError(null)

        try {
            const data = await AdminService.getAdminSummaryWithDates(password, fromDate, toDate)
            const elapsed = Date.now() - start
            const delay = Math.max(0, 2000 - elapsed)

            setTimeout(() => {
                setSummary(data)
                setIsLoading(false)
            }, delay)
        } catch (err) {
            console.error("Error fetching filtered admin summary:", err)
            setError("Failed to load mystic ledger data.")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void fetchInitialSummary()
    }, [fetchInitialSummary])

    return (
        <div className="space-y-8">
            <div className="flex justify-center">
                <button onClick={onExitAction} className="mystical-button flex items-center justify-center">
                    <Shield className="h-4 w-4 mr-2"/>
                    Exit the Sacred Chamber
                </button>
            </div>

            <div className="witch-card bg-black/50 backdrop-blur-sm p-6 border border-white/10 space-y-6 overflow-visible relative z-10">
                <div>
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                            <Calendar className="h-4 w-4 opacity-40"/>
                        </div>
                        <div className="mx-3 h-px w-12 bg-white/20"></div>
                        <h2 className="text-xl font-serif tracking-wide">Temporal Boundaries</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="witch-label">From Date</label>
                            <CustomDatePicker id="fromDate" name="fromDate" value={fromDate} onChangeAction={setFromDate}/>
                        </div>
                        <div>
                            <label className="witch-label">To Date</label>
                            <CustomDatePicker id="toDate" name="toDate" value={toDate} onChangeAction={setToDate}/>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={fetchFilteredSummary}
                        className="mystical-button flex items-center justify-center mx-auto"
                    >
                        <Filter className="h-4 w-4 mr-2"/>
                        Apply Date Filter
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <LoadingCard/>
                ) : error ? (
                    <ErrorCard onRetry={fetchInitialSummary} message={error}/>
                ) : summary ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricCard
                            icon={<Coins className="h-6 w-6 text-green-400"/>}
                            title="Essence Collected"
                            value={formatCurrency(summary.totalRevenue)}
                            iconBg="bg-green-900/30 border-green-500/30"
                            textColor="text-green-400"
                        />
                        <MetricCard
                            icon={<Zap className="h-6 w-6 text-blue-400"/>}
                            title="Arcane Energy Expended"
                            value={formatNumber(summary.tokenUsage)}
                            iconBg="bg-blue-900/30 border-blue-500/30"
                            textColor="text-blue-400"
                        />
                        <MetricCard
                            icon={<TrendingUp className={`h-6 w-6 ${getProfitColor(summary.profit)}`}/>}
                            title="Celestial Balance"
                            value={formatCurrency(summary.profit)}
                            iconBg={
                                summary.profit > 0
                                    ? "bg-green-900/30 border-green-500/30"
                                    : summary.profit < 0
                                        ? "bg-red-900/30 border-red-500/30"
                                        : "bg-gray-900/30 border-gray-500/30"
                            }
                            textColor={getProfitColor(summary.profit)}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    )
}

function LoadingCard() {
    return (
        <div className="witch-card bg-black/50 backdrop-blur-sm text-center p-8">
            <div className="flex flex-col items-center space-y-4">
                <div className="moon-loader w-16 h-16"></div>
                <p className="text-white/80 animate-pulse">Consulting the ethereal ledgers...</p>
            </div>
        </div>
    )
}

function ErrorCard({onRetry, message}: { onRetry: () => void; message: string }) {
    return (
        <div className="witch-card bg-black/50 backdrop-blur-sm text-center p-8">
            <div className="mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-400"/>
                    </div>
                </div>
                <h3 className="text-xl font-serif mb-3 text-red-400">The Ledger Speaks in Riddles</h3>
                <p className="text-white/80 font-light max-w-md mx-auto">{message}</p>
            </div>
            <button onClick={onRetry} className="mystical-button flex items-center justify-center mx-auto">
                <Moon className="h-4 w-4 mr-2 opacity-80"/>
                Consult the Records Again
            </button>
        </div>
    )
}

function MetricCard({
                        icon,
                        title,
                        value,
                        iconBg,
                        textColor,
                    }: {
    icon: React.ReactNode
    title: string
    value: string
    iconBg: string
    textColor: string
}) {
    return (
        <div className="witch-card bg-black/50 backdrop-blur-sm p-6 border border-white/10">
            <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full ${iconBg} border flex items-center justify-center`}>{icon}</div>
                <div className="ml-4">
                    <h3 className={`text-lg font-serif ${textColor}`}>{title}</h3>
                </div>
            </div>
            <div className="text-center">
                <p className={`text-3xl font-bold mb-2 ${textColor}`}>{value}</p>
            </div>
        </div>
    )
}

function formatCurrency(amount: number): string {
    return `${amount.toFixed(4)} $`
}

function formatNumber(num: number): string {
    return num.toLocaleString()
}

function getProfitColor(profit: number): string {
    if (profit > 0) return "text-green-400"
    if (profit < 0) return "text-red-400"
    return "text-white/80"
}
