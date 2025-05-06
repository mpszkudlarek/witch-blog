"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wand2 } from "lucide-react"
import { submitDivinationForm } from "@/actions/divination-actions"
import CustomDatePicker from "./custom-date-picker"

interface DivinationFormState {
  name: string
  dateOfBirth: string
  favoriteColor: string
  favoriteNumber: string
  relationshipStatus: string
}

// Add a new interface for form validation errors
interface FormErrors {
  name?: string
  dateOfBirth?: string
  favoriteColor?: string
  favoriteNumber?: string
  relationshipStatus?: string
}

/**
 * DivinationForm component handles user input for tarot readings
 * Collects personal information used to generate personalized divinations
 */
export default function DivinationForm() {
  const router = useRouter()

  // Update the initial state to remove divinationCount
  const [formData, setFormData] = useState<DivinationFormState>({
    name: "",
    dateOfBirth: "",
    favoriteColor: "",
    favoriteNumber: "",
    relationshipStatus: "",
  })

  // Add state for form validation errors
  const [errors, setErrors] = useState<FormErrors>({})

  // Track form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handle changes to form inputs
   * @param e - The input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user makes changes
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  /**
   * Handle date changes from the CustomDatePicker
   * @param value - The selected date in YYYY-MM-DD format
   */
  const handleDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: value }))

    // Clear date of birth error when user selects a date
    if (errors.dateOfBirth) {
      setErrors((prev) => ({ ...prev, dateOfBirth: undefined }))
    }
  }

  /**
   * Validate the form data
   * @returns True if the form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name"
      isValid = false
    }

    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Please select your date of birth"
      isValid = false
    }

    // Validate favorite color
    if (!formData.favoriteColor) {
      newErrors.favoriteColor = "Please select your favorite color"
      isValid = false
    }

    // Validate favorite number
    if (!formData.favoriteNumber) {
      newErrors.favoriteNumber = "Please enter your favorite number"
      isValid = false
    }

    // Validate relationship status
    if (!formData.relationshipStatus) {
      newErrors.relationshipStatus = "Please select your relationship status"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  /**
   * Handle form submission
   * @param e - The form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Submit form data to the server action
      const result = await submitDivinationForm(formData)

      if (result.success) {
        // Store form data in session storage for later use in the divination process
        sessionStorage.setItem("divinationData", JSON.stringify(formData))
        router.push("/payment")
      } else {
        console.error("Form submission failed")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }

  // Color options for the dropdown with descriptive labels
  const colorOptions = [
    { value: "", label: "Select your favorite color" },
    { value: "red", label: "Red - Passion & Energy" },
    { value: "orange", label: "Orange - Creativity & Enthusiasm" },
    { value: "yellow", label: "Yellow - Joy & Intellect" },
    { value: "green", label: "Green - Growth & Harmony" },
    { value: "blue", label: "Blue - Tranquility & Truth" },
    { value: "purple", label: "Purple - Spirituality & Mystery" },
    { value: "pink", label: "Pink - Love & Nurturing" },
    { value: "brown", label: "Brown - Stability & Grounding" },
    { value: "black", label: "Black - Power & Protection" },
    { value: "white", label: "White - Purity & Clarity" },
    { value: "silver", label: "Silver - Intuition & Reflection" },
    { value: "gold", label: "Gold - Wisdom & Prosperity" },
    { value: "other", label: "Other - Mystical Essence" },
  ]

  // Fixed cost for divination
  const cost = 15

  return (
      <div className="witch-card border border-white/10" style={{ transform: "none", transition: "none" }}>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="witch-label">
                Your Name
              </label>
              <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`witch-input ${errors.name ? "border-red-400" : ""}`}
                  placeholder="Enter your name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Date of Birth Field */}
            <div>
              <label htmlFor="dateOfBirth" className="witch-label">
                Date of Birth
              </label>
              <CustomDatePicker
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  placeholder="Select your date of birth"
                  hasError={!!errors.dateOfBirth}
              />
              {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>

            {/* Favorite Color Field */}
            <div>
              <label htmlFor="favoriteColor" className="witch-label">
                Favorite Color
              </label>
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
              <label htmlFor="favoriteNumber" className="witch-label">
                Favorite Number
              </label>
              <input
                  type="number"
                  id="favoriteNumber"
                  name="favoriteNumber"
                  value={formData.favoriteNumber}
                  onChange={handleChange}
                  className={`witch-input ${errors.favoriteNumber ? "border-red-400" : ""}`}
                  placeholder="Enter your favorite number"
                  min="0"
                  step="1"
              />
              {errors.favoriteNumber && <p className="text-red-400 text-xs mt-1">{errors.favoriteNumber}</p>}
            </div>

            {/* Relationship Status Field */}
            <div>
              <label htmlFor="relationshipStatus" className="witch-label">
                Relationship Status
              </label>
              <select
                  id="relationshipStatus"
                  name="relationshipStatus"
                  value={formData.relationshipStatus}
                  onChange={handleChange}
                  className={`witch-input bg-transparent ${errors.relationshipStatus ? "border-red-400" : ""}`}
              >
                <option value="" disabled>
                  Select your relationship status
                </option>
                <option value="single">Single</option>
                <option value="in_relationship">In a relationship</option>
                <option value="married">Married</option>
                <option value="separated">Separated</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="complicated">It&apos;s complicated</option>
              </select>
              {errors.relationshipStatus && <p className="text-red-400 text-xs mt-1">{errors.relationshipStatus}</p>}
            </div>
          </div>

          {/* Pricing information */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4 text-lg font-medium">
              <span>Total:</span>
              <span>${cost.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
                type="submit"
                className="mystical-button w-full flex items-center justify-center"
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                  <span className="flex items-center">
                <span className="animate-pulse mr-2">✧</span>
                Preparing...
              </span>
              ) : (
                  <span className="flex items-center">
                <Wand2 className="h-4 w-4 mr-2" />
                Begin Divination
              </span>
              )}
            </button>
          </div>
        </form>
      </div>
  )
}
