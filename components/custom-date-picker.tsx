"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

/**
 * Props for the CustomDatePicker component
 */
interface DatePickerProps {
  /** Current date value in YYYY-MM-DD format */
  value: string
  /** Callback function when date changes */
  onChange: (value: string) => void
  /** HTML id attribute for the hidden input */
  id: string
  /** HTML name attribute for the hidden input */
  name: string
  /** Whether the date input is required */
  required?: boolean
  /** Placeholder text when no date is selected */
  placeholder?: string
  /** Whether the input has an error */
  hasError?: boolean
}

/**
 * Formats a Date object to YYYY-MM-DD format for form submission
 * @param date - The date to format, or null
 * @returns Formatted date string or empty string if date is null
 */
const formatDateForInput = (date: Date | null): string => {
  if (!date) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Formats a Date object to DD-MM-YYYY format for display
 * @param date - The date to format, or null
 * @param placeholder - Placeholder text to return if date is null
 * @returns Formatted date string or placeholder if date is null
 */
const formatDateForDisplay = (date: Date | null, placeholder: string): string => {
  if (!date) return placeholder

  // Format as dd-mm-yyyy
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

/**
 * A custom date picker component that allows both calendar selection and direct text input
 * Supports typing dates in formats like "12122001" which will be formatted as "12-12-2001"
 */
export default function CustomDatePicker({
                                           value,
                                           onChange,
                                           id,
                                           name,
                                           placeholder = "Select date of birth",
                                           hasError = false,
                                         }: DatePickerProps) {
  // Parse initial date from the input value
  const initialDate = value ? new Date(value) : null

  // State declarations
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [inputValue, setInputValue] = useState(initialDate ? formatDateForDisplay(initialDate, placeholder) : "")
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(initialDate?.getMonth() || new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(initialDate?.getFullYear() || new Date().getFullYear())
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days")
  const [yearRange, setYearRange] = useState<number[]>([])

  // Refs
  const calendarRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate year range for year picker (100 years in the past)
  useEffect(() => {
    const currentYearValue = new Date().getFullYear()
    const startYear = currentYearValue - 100
    const years = Array.from({ length: 101 }, (_, i) => startYear + i)
    setYearRange(years)
  }, [])

  /**
   * Navigate to the previous month in the calendar
   */
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  /**
   * Navigate to the next month in the calendar
   */
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  /**
   * Handle date selection from the calendar
   * @param day - The day of the month that was selected
   */
  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(newDate)
    setInputValue(formatDateForDisplay(newDate, placeholder))
    onChange(formatDateForInput(newDate))
    setIsOpen(false)
  }

  /**
   * Handle month selection from the month picker
   * @param month - The month index (0-11) that was selected
   */
  const handleMonthSelect = (month: number) => {
    setCurrentMonth(month)
    setViewMode("days")
  }

  /**
   * Handle year selection from the year picker
   * @param year - The year that was selected
   */
  const handleYearSelect = (year: number) => {
    setCurrentYear(year)
    setViewMode("months")
  }

  /**
   * Handle click on the calendar icon to open the date picker
   */
  const handleDateInputClick = () => {
    setIsOpen(true)
    setViewMode("years")
  }

  /**
   * Get the number of days in a specific month
   * @param year - The year
   * @param month - The month index (0-11)
   * @returns The number of days in the month
   */
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate()
  }

  /**
   * Get the day of week for the first day of a month
   * @param year - The year
   * @param month - The month index (0-11)
   * @returns The day of week (0 = Sunday, 6 = Saturday)
   */
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay()
  }

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update the calendar when value changes externally
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setInputValue(formatDateForDisplay(date, placeholder))
      setCurrentMonth(date.getMonth())
      setCurrentYear(date.getFullYear())
    }
  }, [value, placeholder])

  /**
   * Generate the calendar days for the current month view
   * @returns Array of day elements to render
   */
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
    const days = []
    const today = new Date()

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="date-picker-day invisible"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
          selectedDate &&
          selectedDate.getDate() === day &&
          selectedDate.getMonth() === currentMonth &&
          selectedDate.getFullYear() === currentYear

      const isToday =
          today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear

      days.push(
          <button
              key={day}
              type="button"
              onClick={() => handleDateSelect(day)}
              className={`date-picker-day ${isSelected ? "date-picker-day-selected" : ""} ${
                  isToday ? "date-picker-day-today" : ""
              }`}
          >
            {day}
          </button>,
      )
    }

    return days
  }

  /**
   * Generate the month picker view
   * @returns Month picker UI elements
   */
  const renderMonthPicker = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    return (
        <div className="grid grid-cols-3 gap-2 p-2">
          {monthNames.map((month, index) => (
              <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthSelect(index)}
                  className={`p-2 rounded-sm hover:bg-white/10 transition-colors ${
                      index === currentMonth ? "bg-white/20" : ""
                  }`}
              >
                {month.substring(0, 3)}
              </button>
          ))}
        </div>
    )
  }

  /**
   * Generate the year picker view
   * @returns Year picker UI elements
   */
  const renderYearPicker = () => {
    return (
        <div className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 p-2">
          <div className="grid grid-cols-4 gap-2">
            {yearRange.map((year) => (
                <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`p-2 rounded-sm hover:bg-white/10 transition-colors ${
                        year === currentYear ? "bg-white/20" : ""
                    }`}
                >
                  {year}
                </button>
            ))}
          </div>
        </div>
    )
  }

  /**
   * Parse a date string in various formats
   * @param input - The date string to parse
   * @returns A Date object if parsing was successful, null otherwise
   */
  const parseInputDate = (input: string): Date | null => {
    // Remove any non-numeric characters
    const digitsOnly = input.replace(/\D/g, "")

    // Check if we have 8 digits (DDMMYYYY or MMDDYYYY)
    if (digitsOnly.length === 8) {
      // Try DD-MM-YYYY format
      const day = Number.parseInt(digitsOnly.substring(0, 2))
      const month = Number.parseInt(digitsOnly.substring(2, 4)) - 1 // JS months are 0-indexed
      const year = Number.parseInt(digitsOnly.substring(4, 8))

      const dateAttempt1 = new Date(year, month, day)
      if (dateAttempt1.getFullYear() === year && dateAttempt1.getMonth() === month && dateAttempt1.getDate() === day) {
        return dateAttempt1
      }

      // Try MM-DD-YYYY format
      const month2 = Number.parseInt(digitsOnly.substring(0, 2)) - 1
      const day2 = Number.parseInt(digitsOnly.substring(2, 4))

      const dateAttempt2 = new Date(year, month2, day2)
      if (
          dateAttempt2.getFullYear() === year &&
          dateAttempt2.getMonth() === month2 &&
          dateAttempt2.getDate() === day2
      ) {
        return dateAttempt2
      }
    }

    // Try to parse as a standard date string
    const standardDate = new Date(input)
    if (!isNaN(standardDate.getTime())) {
      return standardDate
    }

    return null
  }

  /**
   * Format the input value as the user types
   * @param value - The current input value
   * @returns The formatted value with hyphens added
   */
  const formatAsUserTypes = (value: string): string => {
    // Remove any non-numeric characters
    const digitsOnly = value.replace(/\D/g, "")

    // Don't format if we don't have enough digits
    if (digitsOnly.length <= 0) return value

    // Format as DD-MM-YYYY as the user types
    let formattedValue = ""

    // Add day
    if (digitsOnly.length >= 1) {
      formattedValue += digitsOnly.substring(0, Math.min(2, digitsOnly.length))
    }

    // Add month separator and month
    if (digitsOnly.length > 2) {
      formattedValue += "-" + digitsOnly.substring(2, Math.min(4, digitsOnly.length))
    }

    // Add year separator and year
    if (digitsOnly.length > 4) {
      formattedValue += "-" + digitsOnly.substring(4, Math.min(8, digitsOnly.length))
    }

    return formattedValue
  }

  /**
   * Handle input changes with reactive formatting
   * @param e - The input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value

    // Store cursor position
    const cursorPosition = e.target.selectionStart || 0

    // Count how many hyphens are before the cursor in the original value
    const hyphensBefore = (rawValue.substring(0, cursorPosition).match(/-/g) || []).length

    // Format the value
    const formattedValue = formatAsUserTypes(rawValue)

    // Set the formatted value
    setInputValue(formattedValue)

    // If we have 8 digits (a complete date), try to parse and validate it
    const digitsOnly = rawValue.replace(/\D/g, "")
    if (digitsOnly.length === 8) {
      const parsedDate = parseInputDate(digitsOnly)
      if (parsedDate) {
        setSelectedDate(parsedDate)
        onChange(formatDateForInput(parsedDate))
      }
    }

    // Restore cursor position, accounting for added hyphens
    setTimeout(() => {
      if (inputRef.current) {
        const newHyphensBefore = (formattedValue.substring(0, cursorPosition).match(/-/g) || []).length
        const hyphenDiff = newHyphensBefore - hyphensBefore
        inputRef.current.selectionStart = inputRef.current.selectionEnd = cursorPosition + hyphenDiff
      }
    }, 0)
  }

  /**
   * Handle input blur event
   * Validates and formats the date when the user leaves the input field
   */
  const handleInputBlur = () => {
    // Try to parse the input as a date
    const parsedDate = parseInputDate(inputValue)

    if (parsedDate) {
      setSelectedDate(parsedDate)
      onChange(formatDateForInput(parsedDate))
      // Update the input value to ensure consistent formatting
      setInputValue(formatDateForDisplay(parsedDate, placeholder))
    } else {
      // Reset to previous valid date or empty
      setInputValue(selectedDate ? formatDateForDisplay(selectedDate, placeholder) : "")
    }
  }

  // Month names for header display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
      <div className="date-picker-container">
        {/* Hidden input for form submission */}
        <input type="hidden" id={id} name={name} value={formatDateForInput(selectedDate)} />

        {/* Custom input display */}
        <div className={`date-picker-input-container ${hasError ? "border-red-400" : ""}`}>
          <input
              ref={inputRef}
              type="text"
              className="date-picker-input-text"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
          />
          <Calendar size={16} className="date-picker-input-icon" onClick={handleDateInputClick} />
        </div>

        {/* Calendar dropdown */}
        {isOpen && (
            <div className="date-picker-calendar" ref={calendarRef}>
              <div className="date-picker-header">
                {viewMode === "days" && (
                    <>
                      <button type="button" onClick={prevMonth} className="date-picker-nav-button">
                        <ChevronLeft size={16} />
                      </button>

                      <div
                          className="date-picker-month-year cursor-pointer hover:text-white transition-colors"
                          onClick={() => setViewMode("years")}
                      >
                        {monthNames[currentMonth]} {currentYear}
                      </div>

                      <button type="button" onClick={nextMonth} className="date-picker-nav-button">
                        <ChevronRight size={16} />
                      </button>
                    </>
                )}

                {viewMode === "months" && (
                    <>
                      <button
                          type="button"
                          onClick={() => setViewMode("years")}
                          className="date-picker-month-year cursor-pointer hover:text-white transition-colors"
                      >
                        {currentYear}
                      </button>
                    </>
                )}

                {viewMode === "years" && (
                    <>
                      <div className="date-picker-month-year">Select Year</div>
                    </>
                )}
              </div>

              {viewMode === "days" && (
                  <>
                    <div className="date-picker-weekdays">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div key={day} className="date-picker-weekday">
                            {day}
                          </div>
                      ))}
                    </div>

                    <div className="date-picker-days">{renderCalendarDays()}</div>
                  </>
              )}

              {viewMode === "months" && renderMonthPicker()}
              {viewMode === "years" && renderYearPicker()}
            </div>
        )}
      </div>
  )
}
