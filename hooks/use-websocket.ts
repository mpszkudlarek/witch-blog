"use client"

import { useState, useEffect, useCallback } from "react"
import { webSocketService } from "@/services/websocket-service"
import type { WebSocketMessageType, ConnectionStatus } from "@/types/websocket"
import type { WebSocketMessage } from "@/types/websocket"

/**
 * Custom hook for using WebSocket connections
 * @param messageTypes - Array of message types to subscribe to
 * @returns WebSocket state and methods
 */
export function useWebSocket(messageTypes: WebSocketMessageType[] = []) {
  const [status, setStatus] = useState<ConnectionStatus>(webSocketService.getConnectionStatus())
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      setError(null)
      await webSocketService.connect()
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to connect to WebSocket"))
    }
  }, [])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect()
  }, [])

  // Send a message
  const sendMessage = useCallback(
    async <T, R>(type: WebSocketMessageType, payload: T, timeoutMs?: number): Promise<WebSocketMessage<R>> => {
      try {
        return await webSocketService.sendMessage<T, R>(type, payload, timeoutMs)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to send WebSocket message"))
        throw err
      }
    },
    [],
  )

  // Subscribe to status changes
  useEffect(() => {
    const handleStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ status: ConnectionStatus }>
      setStatus(customEvent.detail.status)
    }

    window.addEventListener("websocket-status-change", handleStatusChange)

    return () => {
      window.removeEventListener("websocket-status-change", handleStatusChange)
    }
  }, [])

  // Subscribe to message types
  useEffect(() => {
    const handlers: { [key: string]: (message: WebSocketMessage) => void } = {}

    messageTypes.forEach((type) => {
      const handler = (message: WebSocketMessage) => {
        setMessages((prev) => [...prev, message])
      }

      handlers[type] = handler
      webSocketService.on(type, handler)
    })

    return () => {
      messageTypes.forEach((type) => {
        if (handlers[type]) {
          webSocketService.off(type, handlers[type])
        }
      })
    }
  }, [messageTypes])

  return {
    status,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
  }
}
