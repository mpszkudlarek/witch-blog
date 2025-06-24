"use client"

import type React from "react"
import {useState} from "react"
import {useRouter} from "next/navigation"
import {Wand2} from "lucide-react"
import CustomDatePicker from "./custom-date-picker"
import {startDivinationProcess} from "@/services/orchestrator-api"
import {getOrCreateUserId} from "@/lib/utils"

interface DivinationFormState {
    name: string
    dateOfBirth: string
    favoriteColor: string
    favoriteNumber: string
    relationshipStatus: string
}

interface FormErrors {
    name?: string
    dateOfBirth?: string
    favoriteColor?: string
    favoriteNumber?: string
    relationshipStatus?: string
}

export default function DivinationForm() {
    const router = useRouter()

    const [formData, setFormData] = useState<DivinationFormState>({
        name: "",
        dateOfBirth: "",
        favoriteColor: "",
        favoriteNumber: "",
        relationshipStatus: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target
        setFormData((prev) => ({...prev, [name]: value}))
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({...prev, [name]: undefined}))
        }
    }

    const handleDateChange = (value: string) => {
        setFormData((prev) => ({...prev, dateOfBirth: value}))
        if (errors.dateOfBirth) {
            setErrors((prev) => ({...prev, dateOfBirth: undefined}))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        let isValid = true

        if (!formData.name.trim()) {
            newErrors.name = "The stars need a name to align"
            isValid = false
        }
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Reveal the date of your celestial arrival"
            isValid = false
        }
        if (!formData.favoriteColor) {
            newErrors.favoriteColor = "Choose the hue of your aura"
            isValid = false
        }
        if (!formData.favoriteNumber) {
            newErrors.favoriteNumber = "Your guiding number is missing"
            isValid = false
        }
        if (!formData.relationshipStatus) {
            newErrors.relationshipStatus = "Tell us of your heart's journey"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            const userId = getOrCreateUserId()
            const process = await startDivinationProcess(userId, formData)
            const processId = process.id

            sessionStorage.setItem("divinationData", JSON.stringify(formData))
            router.push(`/payment?userId=${userId}&processId=${processId}`)
        } catch (err) {
            console.error("Form submission failed:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const colorOptions = [
        {value: "", label: "Choose the hue of your aura"},
        {value: "red", label: "Red - Passion & Energy"},
        {value: "orange", label: "Orange - Creativity & Enthusiasm"},
        {value: "yellow", label: "Yellow - Joy & Intellect"},
        {value: "green", label: "Green - Growth & Harmony"},
        {value: "blue", label: "Blue - Tranquility & Truth"},
        {value: "purple", label: "Purple - Spirituality & Mystery"},
        {value: "pink", label: "Pink - Love & Nurturing"},
        {value: "brown", label: "Brown - Stability & Grounding"},
        {value: "black", label: "Black - Power & Protection"},
        {value: "white", label: "White - Purity & Clarity"},
        {value: "silver", label: "Silver - Intuition & Reflection"},
        {value: "gold", label: "Gold - Wisdom & Prosperity"},
        {value: "other", label: "Other - Mystical Essence"},
    ]

    const cost = 1

    return (
        <div className="witch-card border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="witch-label">Name Given by the Stars</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`witch-input ${errors.name ? "border-red-400" : ""}`}
                        placeholder="Whisper your true name..."
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Date of Birth Field */}
                <div>
                    <label htmlFor="dateOfBirth" className="witch-label">Birth Under the Moon</label>
                    <CustomDatePicker
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChangeAction={handleDateChange}
                        placeholder="Select the night you arrived"
                        hasError={!!errors.dateOfBirth}
                    />
                    {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
                </div>

                {/* Favorite Color Field */}
                <div>
                    <label htmlFor="favoriteColor" className="witch-label">Color of Your Aura</label>
                    <select
                        id="favoriteColor"
                        name="favoriteColor"
                        value={formData.favoriteColor}
                        onChange={handleChange}
                        className={`witch-input bg-transparent ${errors.favoriteColor ? "border-red-400" : ""}`}
                    >
                        {colorOptions.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.value === ""}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.favoriteColor && <p className="text-red-400 text-xs mt-1">{errors.favoriteColor}</p>}
                </div>

                {/* Favorite Number Field */}
                <div>
                    <label htmlFor="favoriteNumber" className="witch-label">Your Guiding Number</label>
                    <input
                        type="number"
                        id="favoriteNumber"
                        name="favoriteNumber"
                        value={formData.favoriteNumber}
                        onChange={handleChange}
                        className={`witch-input ${errors.favoriteNumber ? "border-red-400" : ""}`}
                        placeholder="What number follows you in dreams?"
                        min="0"
                        step="1"
                    />
                    {errors.favoriteNumber && <p className="text-red-400 text-xs mt-1">{errors.favoriteNumber}</p>}
                </div>

                {/* Relationship Status Field */}
                <div>
                    <label htmlFor="relationshipStatus" className="witch-label">Matters of the Heart</label>
                    <select
                        id="relationshipStatus"
                        name="relationshipStatus"
                        value={formData.relationshipStatus}
                        onChange={handleChange}
                        className={`witch-input bg-transparent ${errors.relationshipStatus ? "border-red-400" : ""}`}
                    >
                        <option value="" disabled>Share the state of your heart</option>
                        <option value="single">Alone on the Path</option>
                        <option value="in_relationship">Entwined with Another</option>
                        <option value="married">Bound by Sacred Vows</option>
                        <option value="separated">Wandering Apart</option>
                        <option value="divorced">Released from Union</option>
                        <option value="widowed">Left Behind by Fate</option>
                        <option value="complicated">Entangled in Mysteries</option>
                    </select>
                    {errors.relationshipStatus && <p className="text-red-400 text-xs mt-1">{errors.relationshipStatus}</p>}
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4 text-lg font-medium">
                        <span>Offering to the Spirits:</span>
                        <span>${cost.toFixed(2)}</span>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="mystical-button w-full flex items-center justify-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <span className="animate-pulse mr-2">✧</span>
                                Preparing your path...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Wand2 className="h-4 w-4 mr-2"/>
                                Unveil My Fate
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
