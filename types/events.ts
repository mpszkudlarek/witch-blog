/**
 * Event system types for the tarot divination application
 * Provides type-safe handling of backend events with extensible architecture
 */

// ============================================================================
// ENUMS - Mirror the backend Java enums
// ============================================================================

export enum DivinationProcessStatus {
    Started = "Started",
    Pending = "Pending",
    PaymentAccepted = "PaymentAccepted",
    FailedIntegrationWithChatGPT = "FailedIntegrationWithChatGPT",
    FinishedWithWrongPaymentStatus = "FinishedWithWrongPaymentStatus",
    Finished = "Finished",
}

export enum DivinationGenerationStatus {
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

export enum PaymentState {
    PENDING = "PENDING",
    PAYMENT_SUCCEEDED = "PAYMENT_SUCCEEDED",
    PAYMENT_FAILED_TECHNICAL_ERROR = "PAYMENT_FAILED_TECHNICAL_ERROR",
    PAYMENT_FAILED_BUSINESS_ERROR = "PAYMENT_FAILED_BUSINESS_ERROR",
}

// ============================================================================
// BASE TYPES
// ============================================================================

export interface TarotCard {
    cardName: string
    description: string
    isReversed: boolean
}

/**
 * Base event structure - all events have this nested type structure
 */
export interface BaseEvent {
    type: {
        type: string
    }
}

// ============================================================================
// EVENT INTERFACES - Each event type with discriminated union pattern
// ============================================================================

export interface DivinationRequestedEvent extends BaseEvent {
    type: {
        type: "divination.requested"
    }
    cards: TarotCard[]
}

export interface ProcessStartedEvent extends BaseEvent {
    type: {
        type: "process.started"
    }
    processId: string
}

export interface ProcessEndedEvent extends BaseEvent {
    type: {
        type: "process.ended"
    }
    status: DivinationProcessStatus
    message: string
}

export interface DivinationGenerationEvent extends BaseEvent {
    type: {
        type: "divination.generation"
    }
    divination: string
    status: DivinationGenerationStatus
}

export interface IncorrectBLIKCodeEvent extends BaseEvent {
    type: {
        type: "payment.blik.incorrect"
    }
    message: string
}

export interface PaymentCompletedEvent extends BaseEvent {
    type: {
        type: "payment.completed"
    }
    state: PaymentState
    message: string
}

// ============================================================================
// UNION TYPES - Discriminated union for all possible events
// ============================================================================

/**
 * Union type representing all possible frontend events
 * This is the main type used throughout the application
 */
export type FrontendEvent =
    | DivinationRequestedEvent
    | ProcessStartedEvent
    | ProcessEndedEvent
    | DivinationGenerationEvent
    | IncorrectBLIKCodeEvent
    | PaymentCompletedEvent

/**
 * Extract event type strings for type-safe event type checking
 */
export type EventType = FrontendEvent["type"]["type"]

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

/**
 * Generic event handler function type
 */
export type EventHandler<T extends FrontendEvent> = (event: T) => void | Promise<void>

/**
 * Map of all possible event handlers
 * Optional handlers allow for selective event handling
 */
export interface EventHandlers {
    onDivinationRequested?: EventHandler<DivinationRequestedEvent>
    onProcessStarted?: EventHandler<ProcessStartedEvent>
    onProcessEnded?: EventHandler<ProcessEndedEvent>
    onDivinationGeneration?: EventHandler<DivinationGenerationEvent>
    onIncorrectBLIKCode?: EventHandler<IncorrectBLIKCodeEvent>
    onPaymentCompleted?: EventHandler<PaymentCompletedEvent>
    onUnknownEvent?: (rawEvent: unknown) => void | Promise<void>
}

// ============================================================================
// VALIDATION SCHEMAS - Runtime validation helpers
// ============================================================================

/**
 * Validation result for event parsing
 */
export interface ValidationResult<T> {
    success: boolean
    data?: T
    error?: string
}

/**
 * Event parsing error details
 */
export interface EventParsingError {
    type: "validation_error" | "unknown_event_type" | "malformed_json"
    message: string
    rawEvent?: unknown
}
