import type { DivinationFormData, DivinationResult, TarotCard } from "@/types"
import { v4 as uuidv4 } from "uuid"

// Define all tarot cards with their meanings
const TAROT_CARDS: Array<{
  name: string
  image: string
  description: string
  reversedDescription: string
}> = [
  {
    name: "The Moon",
    image: "/icons/moon-icon.svg",
    description:
        "The Moon represents your intuition and the mysteries of the unconscious. Your connection to the mystical is strong, and you should trust your inner voice.",
    reversedDescription:
        "Your intuition may be clouded, leading to confusion and misunderstanding. Take time to clarify your perceptions and beware of illusion and deception.",
  },
  {
    name: "The Star",
    image: "/icons/star-icon.svg",
    description:
        "The Star brings hope, inspiration, and spiritual guidance. A period of healing and renewal awaits you, bringing peace after difficulty.",
    reversedDescription:
        "You may feel discouraged or lacking inspiration. Remember that darkness is temporary and faith can be rekindled even in the darkest times.",
  },
  {
    name: "The Sun",
    image: "/icons/sun-icon.svg",
    description:
        "The Sun represents vitality, joy, and success. This card brings warmth and positive energy to your life, illuminating your path forward with clarity and optimism.",
    reversedDescription:
        "The Sun's energy may be temporarily obscured, leading to delays or diminished confidence. Remember that even behind clouds, the sun still shines.",
  },
  {
    name: "Death",
    image: "/icons/death-icon.svg",
    description:
        "Death symbolizes transformation, endings, and renewal. This card suggests a significant phase of your life is concluding, making way for new beginnings and growth.",
    reversedDescription:
        "You may be resisting necessary change or transformation. Stagnation and an inability to move forward could be holding you back from personal evolution.",
  },
  {
    name: "The Tower",
    image: "/icons/tower-icon.svg",
    description:
        "The Tower represents sudden change, revelation, and awakening. Though potentially disruptive, this upheaval clears away false structures to reveal truth.",
    reversedDescription:
        "You may be experiencing the chaos of change but resisting its lessons. The Tower reversed suggests internal turmoil that hasn't yet manifested outwardly.",
  },
  {
    name: "The Wheel of Fortune",
    image: "/icons/wheel-icon.svg",
    description:
        "The Wheel of Fortune represents cycles, destiny, and turning points. Life is in flux, and this card suggests embracing the natural changes occurring in your journey.",
    reversedDescription:
        "Bad luck or resistance to life's natural cycles may be affecting you. You may feel stuck or that circumstances are working against your progress.",
  },
  {
    name: "The Lovers",
    image: "/icons/lovers-icon.svg",
    description:
        "The Lovers symbolize relationships, choices, and harmony. This card suggests important decisions about connections in your life.",
    reversedDescription:
        "Disharmony and imbalance in relationships may be affecting you. You may be facing difficult choices or experiencing self-doubt about your values.",
  },
  {
    name: "The Devil",
    image: "/icons/devil-icon.svg",
    description:
        "The Devil symbolizes bondage, materialism, and temptation. This card reveals areas where you may feel trapped or controlled by external forces or your own desires.",
    reversedDescription:
        "You may be breaking free from unhealthy attachments or dependencies. The Devil reversed suggests liberation from self-imposed limitations.",
  },
  {
    name: "Justice",
    image: "/icons/justice-icon.svg",
    description:
        "Justice represents fairness, truth, and balance. This card suggests that your actions have consequences, and fairness will prevail in your situation.",
    reversedDescription:
        "You may be experiencing unfairness or bias in your situation. Justice reversed suggests imbalance or delayed consequences for actions.",
  },
]

/**
 * DivinationService provides methods for generating and interpreting tarot readings
 * This is a simplified mock implementation that will be replaced with real backend calls later
 */
export const DivinationService = {
  /**
   * Generate a divination reading for a user
   * @param userData - The user's personal information
   * @returns A divination result with tarot cards and reading
   */
  generateDivination: async (userData: DivinationFormData): Promise<DivinationResult> => {
    try {
      // Check for OpenAI error flag (for demo purposes)
      const shouldFailOpenAI = typeof window !== "undefined" && sessionStorage.getItem("openai_error") === "true"

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Randomly select 3 cards and determine if they're reversed (33% chance)
      const shuffledCards = [...TAROT_CARDS].sort(() => Math.random() - 0.5)
      const selectedCards = shuffledCards.slice(0, 3).map((card) => {
        const isReversed = Math.random() < 0.33
        return {
          id: uuidv4(),
          name: card.name,
          image: card.image,
          description: isReversed ? card.reversedDescription : card.description,
          reversed: isReversed,
        }
      })

      if (shouldFailOpenAI) {
        return {
          success: true,
          tarotCards: selectedCards,
          openAIError: true,
          message: "The cosmic threads are tangled. Our seers are struggling to channel your reading clearly.",
        }
      }

      // Generate personalized reading
      const personalizedReading = DivinationService.generatePersonalizedReading(userData, selectedCards)

      return {
        success: true,
        tarotCards: selectedCards,
        reading: personalizedReading,
      }
    } catch (error) {
      console.error("Error in generateDivination:", error)
      return { success: false, message: "Failed to generate divination" }
    }
  },

  /**
   * Generate a personalized reading based on user data and selected cards
   * @param userData - The user's personal information
   * @param selectedCards - The tarot cards selected for the reading
   * @returns A formatted personalized reading
   */
  generatePersonalizedReading: (userData: DivinationFormData, selectedCards: TarotCard[]): string => {
    // Count how many cards are reversed
    const reversedCount = selectedCards.filter((card) => card.reversed).length

    // Adjust the reading tone based on the number of reversed cards
    let readingTone: string
    if (reversedCount === 0) {
      readingTone = "Your reading reveals a path of clarity and positive energy."
    } else if (reversedCount === 1) {
      readingTone = "Your reading shows both light and shadow on your path. One challenge requires your attention."
    } else if (reversedCount === 2) {
      readingTone = "Your reading indicates significant challenges ahead. Be mindful of the warnings presented."
    } else {
      readingTone =
          "Your reading reveals a time of great difficulty and transformation. These obstacles are opportunities for profound growth."
    }

    return `
      Dear ${userData.name},
      
      Born on ${new Date(userData.dateOfBirth).toLocaleDateString()}, your astrological alignment reveals a person of deep intuition and spiritual connection. Your affinity for the color ${userData.favoriteColor.toLowerCase()} shows your connection to ${DivinationService.getColorMeaning(userData.favoriteColor.toLowerCase())}.
      
      Your favorite number ${userData.favoriteNumber} resonates with ${DivinationService.getNumberMeaning(Number.parseInt(userData.favoriteNumber))} energy, which influences your path significantly.
      
      Being ${DivinationService.getRelationshipStatusText(userData.relationshipStatus)} affects your spiritual journey in unique ways. ${DivinationService.getRelationshipAdvice(userData.relationshipStatus)}
      
      ${readingTone} The cards have revealed important messages about your path. ${reversedCount > 0 ? "Pay special attention to the reversed cards, as they highlight areas requiring your focus and awareness." : "All cards appear upright, suggesting a time of alignment and forward movement."}
      
      In the coming months, pay attention to your dreams and the subtle signs around you. The universe is speaking to you in ways that only you can understand.
    `
  },

  /**
   * Get the mystical meaning of a color
   * @param color - The color name
   * @returns The mystical meaning of the color
   */
  getColorMeaning: (color: string): string => {
    const colorMeanings: Record<string, string> = {
      black: "mystery and protection",
      white: "purity and spiritual clarity",
      red: "passion and vitality",
      blue: "tranquility and truth",
      green: "growth and abundance",
      purple: "spiritual awareness and psychic abilities",
      yellow: "intellect and personal power",
      pink: "love and emotional healing",
      orange: "creativity and enthusiasm",
      brown: "grounding and stability",
      silver: "intuition and reflection",
      gold: "wisdom and inner wealth",
    }

    return colorMeanings[color] || "unique personal energy"
  },

  /**
   * Get the mystical meaning of a number
   * @param number - The number to interpret
   * @returns The mystical meaning of the number
   */
  getNumberMeaning: (number: number): string => {
    const numberMeanings: Record<number, string> = {
      1: "leadership and independence",
      2: "harmony and partnership",
      3: "creativity and expression",
      4: "stability and foundation",
      5: "change and freedom",
      6: "nurturing and responsibility",
      7: "spirituality and mysticism",
      8: "abundance and power",
      9: "completion and wisdom",
      0: "potential and wholeness",
    }

    // For numbers greater than 9, sum the digits until we get a single digit
    let singleDigit = number
    while (singleDigit > 9) {
      singleDigit = String(singleDigit)
          .split("")
          .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
    }

    return numberMeanings[singleDigit] || "mysterious cosmic"
  },

  /**
   * Get descriptive text for a relationship status
   * @param status - The relationship status code
   * @returns Descriptive text for the relationship status
   */
  getRelationshipStatusText: (status: string): string => {
    const statusTexts: Record<string, string> = {
      single: "on a solitary path",
      in_relationship: "in a partnership",
      married: "in a committed union",
      separated: "in a period of transition",
      divorced: "on a path of renewal",
      widowed: "carrying spiritual connections beyond the physical realm",
      complicated: "navigating complex emotional waters",
    }

    return statusTexts[status] || "on your unique journey"
  },

  /**
   * Get relationship advice based on relationship status
   * @param status - The relationship status code
   * @returns Personalized advice for the relationship status
   */
  getRelationshipAdvice: (status: string): string => {
    const advice: Record<string, string> = {
      single:
          "This is a time for self-discovery and personal growth. The universe is preparing you for meaningful connections ahead.",
      in_relationship:
          "Your current partnership offers important lessons. Focus on clear communication and mutual spiritual growth.",
      married:
          "Your union has deep karmic significance. Together, you can achieve spiritual heights that would be difficult alone.",
      separated: "This transition holds valuable insights. Use this time to reflect on what truly nurtures your soul.",
      divorced: "You've completed an important soul contract. New beginnings await with the wisdom you've gained.",
      widowed:
          "Your connection transcends physical boundaries. Your loved one's energy continues to guide and support you.",
      complicated:
          "Complexity often precedes clarity. Trust that this situation is revealing important truths about your needs and path.",
    }

    return advice[status] || "Your path is uniquely yours to navigate with the wisdom you possess."
  },
}
