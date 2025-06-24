"use client"

import React, {useState, useEffect} from "react"
import {Lock, Eye, EyeOff, Shield} from "lucide-react"
import Link from "next/link"

interface AdminPasswordGateProps {
    onAuthenticatedAction: (password: string) => void
}

const COOLDOWN_MS = 60 * 1000

export default function AdminPasswordGate({onAuthenticatedAction}: AdminPasswordGateProps) {
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [attempts, setAttempts] = useState(0)
    const [isLocked, setIsLocked] = useState(false)
    const [remainingTime, setRemainingTime] = useState(0)

    useEffect(() => {
        const lockUntil = parseInt(sessionStorage.getItem("admin_lock_until") || "0")
        if (Date.now() < lockUntil) {
            setIsLocked(true)
            updateRemainingTime(lockUntil)
        }
    }, [])

    useEffect(() => {
        if (!isLocked) return
        const interval = setInterval(() => {
            const lockUntil = parseInt(sessionStorage.getItem("admin_lock_until") || "0")
            updateRemainingTime(lockUntil)
            if (Date.now() >= lockUntil) {
                setIsLocked(false)
                setAttempts(0)
                setError("")
                sessionStorage.removeItem("admin_lock_until")
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [isLocked])

    const updateRemainingTime = (lockUntil: number) => {
        const diff = Math.max(0, lockUntil - Date.now())
        setRemainingTime(Math.ceil(diff / 1000))
    }

    const verifyPasswordWithBackend = async (inputPassword: string): Promise<boolean> => {
        try {
            const res = await fetch("http://localhost:8080/management-service/profit", {
                headers: {
                    "X-Admin-Password": inputPassword,
                },
            })
            return res.ok
        } catch (err) {
            console.error("Backend password check failed:", err)
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const isValid = await verifyPasswordWithBackend(password)

            if (isValid) {
                onAuthenticatedAction(password)
            } else {
                const newAttempts = attempts + 1
                setAttempts(newAttempts)
                setPassword("")

                if (newAttempts >= 3) {
                    const lockUntil = Date.now() + COOLDOWN_MS
                    sessionStorage.setItem("admin_lock_until", lockUntil.toString())
                    setIsLocked(true)
                    updateRemainingTime(lockUntil)
                    setError("Too many failed attempts. The ethereal barriers strengthen. Wait 1 minute.")
                } else {
                    setError("The mystical passphrase is incorrect. The cosmic guardians deny entry.")
                }
            }
        } catch (err) {
            console.error("Password check failed:", err)
            setError("The cosmic connection falters. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="witch-card bg-black/50 backdrop-blur-sm p-8 max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                        <div className="absolute inset-0 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center">
                            <Lock className="h-8 w-8 text-white/70"/>
                        </div>
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse"></div>
                    </div>

                    <h2 className="text-2xl font-serif mb-3">The Sacred Chamber</h2>
                    <p className="text-white/80 font-light text-sm">
                        The mystical ledger is protected by ancient enchantments. Speak the sacred passphrase to gain entry to the cosmic records.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="adminPassword" className="witch-label">Sacred Passphrase</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="adminPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="witch-input pr-10"
                                placeholder="Enter the mystical passphrase"
                                disabled={isLoading || isLocked}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4 opacity-70"/> : <Eye className="h-4 w-4 opacity-70"/>}
                            </button>
                        </div>
                        <p className="text-xs opacity-50 mt-2 text-center">Hint: Try &#39;tarot123&#39;</p>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 border border-red-500/30 rounded-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="mystical-button w-full flex items-center justify-center"
                        disabled={isLoading || isLocked || !password.trim()}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                <span className="animate-pulse mr-2">✧</span>
                Consulting the Guardians...
              </span>
                        ) : (
                            <span className="flex items-center">
                <Shield className="h-4 w-4 mr-2"/>
                Enter the Sacred Chamber
              </span>
                        )}
                    </button>
                </form>

                {isLocked && (
                    <div className="mt-4 text-center text-sm text-red-400">
                        🔒 Locked. Try again in {remainingTime} seconds.
                    </div>
                )}

                {attempts > 0 && !isLocked && (
                    <div className="mt-4 text-center">
                        <p className="text-xs opacity-60">Attempts: {attempts}/3</p>
                    </div>
                )}
            </div>

            <div className="mt-6 text-center">
                <Link href="/" className="mystical-button inline-flex items-center justify-center text-sm px-4 py-2">
                    Return to the Mortal Realm
                </Link>
            </div>
        </>
    )
}
