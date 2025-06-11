/**
 * Event service for parsing, validating, and dispatching backend events
 */

import type {
    FrontendEvent,
    EventType,
    EventHandlers,
    ValidationResult,
    DivinationRequestedEvent,
    ProcessEndedEvent,
    DivinationGenerationEvent,
    IncorrectBLIKCodeEvent,
    PaymentCompletedEvent,
    TarotCard,
    EventHandler,
} from "@/types/events"

import {
    DivinationProcessStatus,
    DivinationGenerationStatus,
    PaymentState,
} from "@/types/events"

// ============================================================================
// TYPE GUARDS - Runtime type checking functions
// ============================================================================

const hasEventStructure = (obj: unknown): obj is { type: { type: string } } => {
    if (typeof obj !== "object" || obj === null) return false
    const maybe = obj as Record<string, unknown>
    const typeField = maybe["type"]
    if (typeof typeField !== "object" || typeField === null) return false
    return typeof (typeField as Record<string, unknown>)["type"] === "string"
}

const isValidTarotCard = (obj: unknown): obj is TarotCard => {
    if (typeof obj !== "object" || obj === null) return false
    const card = obj as Record<string, unknown>
    return (
        typeof card.cardName === "string" &&
        typeof card.description === "string" &&
        typeof card.isReversed === "boolean"
    )
}

const isValidEnumValue = <T extends Record<string, string>>(
    enumObject: T,
    value: unknown
): value is T[keyof T] => {
    return typeof value === "string" && (Object.values(enumObject) as string[]).includes(value)
}

// ============================================================================
// EVENT TYPE GUARDS - Specific event validation
// ============================================================================

export const isDivinationRequestedEvent = (event: unknown): event is DivinationRequestedEvent => {
    if (!hasEventStructure(event)) return false
    const e = event as Record<string, unknown>
    if ((e.type as Record<string, unknown>)?.type !== "divination.requested") return false
    const cards = e.cards
    return Array.isArray(cards) && cards.every(isValidTarotCard)
}

export const isProcessEndedEvent = (event: unknown): event is ProcessEndedEvent => {
    if (!hasEventStructure(event)) return false
    const e = event as Record<string, unknown>
    if ((e.type as Record<string, unknown>)?.type !== "process.ended") return false
    return isValidEnumValue(DivinationProcessStatus, e.status) && typeof e.message === "string"
}

export const isDivinationGenerationEvent = (event: unknown): event is DivinationGenerationEvent => {
    if (!hasEventStructure(event)) return false
    const e = event as Record<string, unknown>
    if ((e.type as Record<string, unknown>)?.type !== "divination.generation") return false
    return typeof e.divination === "string" && isValidEnumValue(DivinationGenerationStatus, e.status)
}

export const isIncorrectBLIKCodeEvent = (event: unknown): event is IncorrectBLIKCodeEvent => {
    if (!hasEventStructure(event)) return false
    const e = event as Record<string, unknown>
    if ((e.type as Record<string, unknown>)?.type !== "payment.blik.incorrect") return false
    return typeof e.message === "string"
}

export const isPaymentCompletedEvent = (event: unknown): event is PaymentCompletedEvent => {
    if (!hasEventStructure(event)) return false
    const e = event as Record<string, unknown>
    if ((e.type as Record<string, unknown>)?.type !== "payment.completed") return false
    return isValidEnumValue(PaymentState, e.state) && typeof e.message === "string"
}
// ============================================================================
// EVENT PARSING MAP - Centralized event type to parser mapping
// ============================================================================

/**
 * Type guard function for a specific event type
 */
type EventTypeGuard<T extends FrontendEvent> = (event: unknown) => event is T

/**
 * Map of event type strings to their corresponding type guard functions
 */
const eventParsers: Partial<Record<EventType, EventTypeGuard<FrontendEvent>>> = {
    "divination.requested": isDivinationRequestedEvent,
    "process.ended": isProcessEndedEvent,
    "divination.generation": isDivinationGenerationEvent,
    "payment.blik.incorrect": isIncorrectBLIKCodeEvent,
    "payment.completed": isPaymentCompletedEvent,
}
// ============================================================================
// EVENT PARSING AND VALIDATION
// ============================================================================

/**
 * Parse and validate a raw event from the backend
 * Returns a validated FrontendEvent or error details if invalid
 */
export const parseEvent = (rawEvent: unknown): ValidationResult<FrontendEvent> => {
    if (!hasEventStructure(rawEvent)) {
        return {
            success: false,
            error: "Event does not have required type structure",
        }
    }

    const eventLike = rawEvent as { type: { type: string } }
    const eventType = eventLike.type.type

    const parser = eventParsers[eventType as EventType]
    if (typeof parser === "function" && parser(rawEvent)) {
        return { success: true, data: rawEvent }
    }

    return {
        success: false,
        error: parser
            ? `Event validation failed for type: ${eventType}`
            : `Unknown event type: ${eventType}`,
    }
}

/**
 * Parse a JSON string into a validated FrontendEvent
 */
export const parseEventFromJSON = (jsonString: string): ValidationResult<FrontendEvent> => {
    try {
        const rawEvent = JSON.parse(jsonString)
        return parseEvent(rawEvent)
    } catch (error) {
        return {
            success: false,
            error: `JSON parsing failed: ${
                error instanceof Error ? error.message : "Invalid JSON"
            }`,
        }
    }
}
// ============================================================================
// EVENT DISPATCHING
// ============================================================================


/**
 * Dispatch a validated event to the appropriate handler.
 * Calls the handler only if it is defined for the given event type.
 */
export const dispatchEvent = async (
    event: FrontendEvent,
    handlers: EventHandlers
): Promise<void> => {
    const { type } = event

    try {
        switch (type.type) {
            case "divination.requested":
                await handlers.onDivinationRequested?.(event as DivinationRequestedEvent)
                break

            case "process.ended":
                await handlers.onProcessEnded?.(event as ProcessEndedEvent)
                break

            case "divination.generation":
                await handlers.onDivinationGeneration?.(event as DivinationGenerationEvent)
                break

            case "payment.blik.incorrect":
                await handlers.onIncorrectBLIKCode?.(event as IncorrectBLIKCodeEvent)
                break

            case "payment.completed":
                await handlers.onPaymentCompleted?.(event as PaymentCompletedEvent)
                break

            default:
                console.warn("Unhandled event type at runtime.")
                await handlers.onUnknownEvent?.(event)
        }
    } catch (error) {
        console.error("Error dispatching event:", error)
        throw error
    }
}
/**
 * Process a raw event:
 * - Validates the event structure
 * - Dispatches it to the appropriate handler
 * - Handles unknown or invalid events gracefully
 */
export const processRawEvent = async (
    rawEvent: unknown,
    handlers: EventHandlers
): Promise<ValidationResult<void>> => {
    const result = parseEvent(rawEvent)

    if (!result.success || !result.data) {
        try {
            await handlers.onUnknownEvent?.(rawEvent)
        } catch (error) {
            console.error("Error in onUnknownEvent handler:", error)
        }

        return {
            success: false,
            error: result.error,
        }
    }

    try {
        await dispatchEvent(result.data, handlers)
        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: `Event dispatch failed: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        }
    }
}


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all supported event types from the eventParsers map
 */
export const getSupportedEventTypes = (): EventType[] => {
    return Object.keys(eventParsers) as EventType[]
}

/**
 * Check if an event type is supported
 */
export const isEventTypeSupported = (eventType: string): eventType is EventType => {
    return getSupportedEventTypes().includes(eventType as EventType)
}

/**
 * Create a type-safe event handler registry
 */
export class EventHandlerRegistry {
    private handlers: EventHandlers = {}

    /**
     * Register an event handler
     */
    on<T extends FrontendEvent>(eventType: T["type"]["type"], handler: EventHandler<T>): this {
        switch (eventType) {
            case "divination.requested":
                this.handlers.onDivinationRequested = handler as EventHandler<DivinationRequestedEvent>
                break
            case "process.ended":
                this.handlers.onProcessEnded = handler as EventHandler<ProcessEndedEvent>
                break
            case "divination.generation":
                this.handlers.onDivinationGeneration = handler as EventHandler<DivinationGenerationEvent>
                break
            case "payment.blik.incorrect":
                this.handlers.onIncorrectBLIKCode = handler as EventHandler<IncorrectBLIKCodeEvent>
                break
            case "payment.completed":
                this.handlers.onPaymentCompleted = handler as EventHandler<PaymentCompletedEvent>
                break
            default:
                // Type-safe fallback for unknown cases (shouldn't happen)
                throw new Error(`Unsupported event type: ${eventType}`)
        }
        return this
    }

    /**
     * Register unknown event handler
     */
    onUnknown(handler: (rawEvent: unknown) => void | Promise<void>): this {
        this.handlers.onUnknownEvent = handler
        return this
    }

    /**
     * Process an event using registered handlers
     */
    async process(rawEvent: unknown): Promise<ValidationResult<void>> {
        return processRawEvent(rawEvent, this.handlers)
    }

    /**
     * Get current handlers
     */
    getHandlers(): EventHandlers {
        return { ...this.handlers }
    }

    /**
     * Clear all handlers
     */
    clear(): this {
        this.handlers = {}
        return this
    }
}

/**
 * Register a new event parser (runtime extension)
 */
export const registerEventParser = <T extends FrontendEvent>(
    eventType: EventType,
    parser: EventTypeGuard<T>
): void => {
    eventParsers[eventType] = parser as EventTypeGuard<FrontendEvent>
}

/**
 * Unregister an event parser
 */
export const unregisterEventParser = (eventType: EventType): void => {
    delete eventParsers[eventType]
}

/**
 * Get all registered event types
 */
export const getRegisteredEventTypes = (): EventType[] => {
    return Object.keys(eventParsers) as EventType[]
}

/**
 * Check if a specific event type has a registered parser
 */
export const hasEventParser = (eventType: string): eventType is EventType => {
    return eventType in eventParsers
}

