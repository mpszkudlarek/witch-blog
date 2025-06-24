// lib/tarot-utils.ts

export const CARD_NAME_MAP: Record<string, string> = {
    death: "Death",
    devil: "The Devil",
    justice: "Justice",
    lovers: "The Lovers",
    moon: "The Moon",
    star: "The Star",
    sun: "The Sun",
    tower: "The Tower",
    wheel: "Wheel of Fortune",
}

export function formatCardName(raw: string): string {
    return CARD_NAME_MAP[raw] ?? raw
}

export const cardIcons: Record<string, string> = {
    moon: "moon-icon.svg",
    star: "star-icon.svg",
    sun: "sun-icon.svg",
    death: "death-icon.svg",
    tower: "tower-icon.svg",
    wheel: "wheel-icon.svg",
    lovers: "lovers-icon.svg",
    justice: "justice-icon.svg",
    devil: "devil-icon.svg",
}
