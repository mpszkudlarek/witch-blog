"use client"

import { useCallback, useRef, useEffect } from "react"
import { EventHandlerRegistry } from "@/services/event-service"
import type { EventHandlers, FrontendEvent, ValidationResult, EventHandler } from "@/types/events"

interface UseEventHandlerOptions {
    logErrors?: boolean
    logEvents?: boolean
    onParsingError?: (error: string, rawEvent: unknown) => void
}

interface UseEventHandlerReturn {
    processEvent: (rawEvent: unknown) => Promise<ValidationResult<void>>
    getRegistry: () => EventHandlerRegistry
    hasHandler: (eventType: FrontendEvent["type"]["type"]) => boolean
}

export const useEventHandler = (
    handlers: EventHandlers,
    options: UseEventHandlerOptions = {}
): UseEventHandlerReturn => {
    const { logErrors = true, logEvents = false, onParsingError } = options
    const registryRef = useRef<EventHandlerRegistry | null>(null)

    if (!registryRef.current) {
        registryRef.current = new EventHandlerRegistry()
    }

    useEffect(() => {
        const registry = registryRef.current
        if (!registry) return

        registry.clear()

        if (handlers.onDivinationRequested) {
            registry.on("divination.requested", handlers.onDivinationRequested)
        }
        if (handlers.onProcessEnded) {
            registry.on("process.ended", handlers.onProcessEnded)
        }
        if (handlers.onDivinationGeneration) {
            registry.on("divination.generation", handlers.onDivinationGeneration)
        }
        if (handlers.onIncorrectBLIKCode) {
            registry.on("payment.blik.incorrect", handlers.onIncorrectBLIKCode)
        }
        if (handlers.onPaymentCompleted) {
            registry.on("payment.completed", handlers.onPaymentCompleted)
        }
        if (handlers.onUnknownEvent) {
            registry.onUnknown(handlers.onUnknownEvent)
        }
    }, [handlers])

    const processEvent = useCallback(
        async (rawEvent: unknown): Promise<ValidationResult<void>> => {
            const registry = registryRef.current
            if (!registry) {
                const error = "Event handler registry not initialized"
                if (logErrors) console.error(error)
                return { success: false, error }
            }

            if (logEvents) console.log("Processing event:", rawEvent)

            const result = await registry.process(rawEvent)

            if (!result.success) {
                const message = result.error ?? "Unknown processing error"
                if (logErrors) console.error("Event processing failed:", message)
                onParsingError?.(message, rawEvent)
            } else if (logEvents) {
                console.log("Event processed successfully")
            }

            return result
        },
        [logErrors, logEvents, onParsingError]
    )

    const getRegistry = useCallback(() => {
        if (!registryRef.current) {
            registryRef.current = new EventHandlerRegistry()
        }
        return registryRef.current
    }, [])

    const hasHandler = useCallback(
        (eventType: FrontendEvent["type"]["type"]): boolean => {
            const current = registryRef.current?.getHandlers()
            if (!current) return false

            switch (eventType) {
                case "divination.requested":
                    return !!current.onDivinationRequested
                case "process.ended":
                    return !!current.onProcessEnded
                case "divination.generation":
                    return !!current.onDivinationGeneration
                case "payment.blik.incorrect":
                    return !!current.onIncorrectBLIKCode
                case "payment.completed":
                    return !!current.onPaymentCompleted
                default:
                    return false
            }
        },
        []
    )

    return {
        processEvent,
        getRegistry,
        hasHandler,
    }
}

export const useSingleEventHandler = <T extends FrontendEvent>(
    eventType: T["type"]["type"],
    handler: EventHandler<T>,
    options: UseEventHandlerOptions = {}
) => {
    const handlers: EventHandlers = {}

    switch (eventType) {
        case "divination.requested":
            handlers.onDivinationRequested = handler as EventHandler<FrontendEvent>
            break
        case "process.ended":
            handlers.onProcessEnded = handler as EventHandler<FrontendEvent>
            break
        case "divination.generation":
            handlers.onDivinationGeneration = handler as EventHandler<FrontendEvent>
            break
        case "payment.blik.incorrect":
            handlers.onIncorrectBLIKCode = handler as EventHandler<FrontendEvent>
            break
        case "payment.completed":
            handlers.onPaymentCompleted = handler as EventHandler<FrontendEvent>
            break
    }

    const { processEvent } = useEventHandler(handlers, options)
    return processEvent
}
