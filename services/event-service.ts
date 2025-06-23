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
    BusinessErrorEvent,
    TechnicalErrorEvent,
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

export const isBusinessErrorEvent = (event: unknown): event is BusinessErrorEvent => {
    if (!hasEventStructure(event)) return false
    const e = event as Record<string, unknown>
    const type = e.type as Record<string, unknown> | undefined
    const message = e.message

    return (
        typeof type?.type === "string" &&
        type.type === "error.business" &&
        typeof message === "string"
    )
}

export const isTechnicalErrorEvent = (event: unknown): event is TechnicalErrorEvent => {
    if (!hasEventStructure(event)) return false
    const e = event as Record<string, unknown>
    const type = e.type as Record<string, unknown> | undefined
    const message = e.message

    return (
        typeof type?.type === "string" &&
        type.type === "error.technical" &&
        typeof message === "string"
    )
}

// ============================================================================
// EVENT PARSING MAP - Centralized event type to parser mapping
// ============================================================================

type EventTypeGuard<T extends FrontendEvent> = (event: unknown) => event is T

const eventParsers: Partial<Record<EventType, EventTypeGuard<FrontendEvent>>> = {
    "divination.requested": isDivinationRequestedEvent,
    "process.ended": isProcessEndedEvent,
    "divination.generation": isDivinationGenerationEvent,
    "payment.blik.incorrect": isIncorrectBLIKCodeEvent,
    "payment.completed": isPaymentCompletedEvent,
    "error.business": isBusinessErrorEvent,
    "error.technical": isTechnicalErrorEvent,
}

// ============================================================================
// EVENT PARSING AND VALIDATION
// ============================================================================

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
        return {success: true, data: rawEvent}
    }

    return {
        success: false,
        error: parser
            ? `Event validation failed for type: ${eventType}`
            : `Unknown event type: ${eventType}`,
    }
}

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

export const dispatchEvent = async (
    event: FrontendEvent,
    handlers: EventHandlers
): Promise<void> => {
    const {type} = event

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
            case "error.business":
                await handlers.onBusinessError?.(event as BusinessErrorEvent)
                break
            case "error.technical":
                await handlers.onTechnicalError?.(event as TechnicalErrorEvent)
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
        return {success: true}
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

export const getSupportedEventTypes = (): EventType[] => {
    return Object.keys(eventParsers) as EventType[]
}

export const isEventTypeSupported = (eventType: string): eventType is EventType => {
    return getSupportedEventTypes().includes(eventType as EventType)
}

export class EventHandlerRegistry {
    private handlers: EventHandlers = {}

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
            case "error.business":
                this.handlers.onBusinessError = handler as EventHandler<BusinessErrorEvent>
                break
            case "error.technical":
                this.handlers.onTechnicalError = handler as EventHandler<TechnicalErrorEvent>
                break
            default:
                throw new Error(`Unsupported event type: ${eventType}`)
        }
        return this
    }

    onUnknown(handler: (rawEvent: unknown) => void | Promise<void>): this {
        this.handlers.onUnknownEvent = handler
        return this
    }

    async process(rawEvent: unknown): Promise<ValidationResult<void>> {
        return processRawEvent(rawEvent, this.handlers)
    }

    getHandlers(): EventHandlers {
        return {...this.handlers}
    }

    clear(): this {
        this.handlers = {}
        return this
    }
}

export const registerEventParser = <T extends FrontendEvent>(
    eventType: EventType,
    parser: EventTypeGuard<T>
): void => {
    eventParsers[eventType] = parser as EventTypeGuard<FrontendEvent>
}

export const unregisterEventParser = (eventType: EventType): void => {
    delete eventParsers[eventType]
}

export const getRegisteredEventTypes = (): EventType[] => {
    return Object.keys(eventParsers) as EventType[]
}

export const hasEventParser = (eventType: string): eventType is EventType => {
    return eventType in eventParsers
}
