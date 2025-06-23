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
 * Base structure for all backend-sent events.
 */
export interface BaseEvent {
    type: {
        type: string
    }
}

/**
 * Shared structure for events with user and process context.
 */
export interface UserProcessEventBase extends BaseEvent {
    userId: string
    processId: string
}

// ============================================================================
// EVENT INTERFACES - Each event type with discriminated union pattern
// ============================================================================

export interface BusinessErrorEvent extends BaseEvent {
    type: {
        type: "error.business"
    }
    message: string
}

export interface DivinationGenerationEvent extends UserProcessEventBase {
    type: {
        type: "divination.generation"
    }
    divination: string
    status: DivinationGenerationStatus
}

export interface DivinationRequestedEvent extends UserProcessEventBase {
    type: {
        type: "divination.requested"
    }
    cards: TarotCard[]
}

export interface IncorrectBLIKCodeEvent extends UserProcessEventBase {
    type: {
        type: "payment.blik.incorrect"
    }
    message: string
}

export interface PaymentCompletedEvent extends UserProcessEventBase {
    type: {
        type: "payment.completed"
    }
    state: PaymentState
    message: string
}

export interface ProcessEndedEvent extends UserProcessEventBase {
    type: {
        type: "process.ended"
    }
    status: DivinationProcessStatus
    message: string
}

export interface ProcessStartedEvent extends UserProcessEventBase {
    type: {
        type: "process.started"
    }
}

export interface TechnicalErrorEvent extends BaseEvent {
    type: {
        type: "error.technical"
    }
    message: string
}

// ============================================================================
// UNION TYPES
// ============================================================================

export type FrontendEvent =
    | BusinessErrorEvent
    | DivinationGenerationEvent
    | DivinationRequestedEvent
    | IncorrectBLIKCodeEvent
    | PaymentCompletedEvent
    | ProcessEndedEvent
    | ProcessStartedEvent
    | TechnicalErrorEvent

export type EventType = FrontendEvent["type"]["type"]

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type EventHandler<T extends FrontendEvent> = (event: T) => void | Promise<void>

export interface EventHandlers {
    onBusinessError?: EventHandler<BusinessErrorEvent>
    onDivinationGeneration?: EventHandler<DivinationGenerationEvent>
    onDivinationRequested?: EventHandler<DivinationRequestedEvent>
    onIncorrectBLIKCode?: EventHandler<IncorrectBLIKCodeEvent>
    onPaymentCompleted?: EventHandler<PaymentCompletedEvent>
    onProcessEnded?: EventHandler<ProcessEndedEvent>
    onProcessStarted?: EventHandler<ProcessStartedEvent>
    onTechnicalError?: EventHandler<TechnicalErrorEvent>
    onUnknownEvent?: (rawEvent: unknown) => void | Promise<void>
}

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult<T> {
    success: boolean
    data?: T
    error?: string
}

export interface EventParsingError {
    type: "validation_error" | "unknown_event_type" | "malformed_json"
    message: string
    rawEvent?: unknown
}

// ============================================================================
// FORM DATA (OPTIONAL) – shared with divination form submission
// ============================================================================

export interface DivinationFormData {
    name: string
    dateOfBirth?: string
    favoriteNumber?: number
    relationshipStatus?: string
}
