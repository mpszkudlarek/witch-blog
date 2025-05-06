/**
 * WebSocket Service
 *
 * This service handles WebSocket communication with the Spring backend.
 * It provides methods for connecting, sending messages, and handling responses.
 */

import { ApiConfig } from "@/config/api-config"
import { WebSocketMessageType, ConnectionStatus } from "@/types/websocket"
import type {
  WebSocketMessage,
  ConnectPayload,
  HeartbeatPayload,
  PaymentRequestPayload,
  DivinationRequestPayload,
} from "@/types/websocket"
import { v4 as uuidv4 } from "uuid"

class WebSocketService {
  private socket: WebSocket | null = null
  private url: string = ApiConfig.websocket.baseUrl
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED
  private messageHandlers: Map<WebSocketMessageType, ((message: WebSocketMessage) => void)[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts: number = ApiConfig.websocket.reconnectAttempts
  private reconnectTimeout: number = ApiConfig.websocket.reconnectInterval
  private heartbeatInterval: NodeJS.Timeout | null = null
  private clientId = ""
  private lastMessageId = ""
  private pendingMessages: Map<
      string,
      {
        resolve: (value: WebSocketMessage) => void
        reject: (reason: Error) => void
        timeout: NodeJS.Timeout
      }
  > = new Map()

  /**
   * Initialize the WebSocket connection
   * @param url - Optional WebSocket server URL (overrides config)
   * @returns Promise that resolves when connection is established
   */
  public async connect(url?: string): Promise<boolean> {
    if (
        this.connectionStatus === ConnectionStatus.CONNECTED ||
        this.connectionStatus === ConnectionStatus.AUTHENTICATED
    ) {
      console.log("[WebSocketService] Already connected")
      return true
    }

    if (url) {
      this.url = url
    }

    this.connectionStatus = ConnectionStatus.CONNECTING
    this.notifyStatusChange()

    try {
      // Generate a client ID if not already set
      if (!this.clientId) {
        this.clientId = `client-${uuidv4()}`
      }

      return new Promise((resolve, reject) => {
        try {
          // Create WebSocket connection
          this.socket = new WebSocket(this.url)

          // Set up event handlers
          this.socket.onopen = () => this.handleOpen(resolve)
          this.socket.onmessage = (event) => this.handleMessage(event)
          this.socket.onclose = (event) => this.handleClose(event, reject)
          this.socket.onerror = (event) => this.handleError(event, reject)
        } catch (error) {
          console.error("[WebSocketService] Error creating WebSocket:", error)
          this.connectionStatus = ConnectionStatus.ERROR
          this.notifyStatusChange()
          reject(error)
          return false
        }
      })
    } catch (error) {
      console.error("[WebSocketService] Connection error:", error)
      this.connectionStatus = ConnectionStatus.ERROR
      this.notifyStatusChange()
      return false
    }
  }

  /**
   * Close the WebSocket connection
   */
  public disconnect(): void {
    if (this.connectionStatus === ConnectionStatus.DISCONNECTED) {
      return
    }

    console.log("[WebSocketService] Disconnecting WebSocket")

    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    // Clear all pending message timeouts
    this.pendingMessages.forEach(({ timeout }) => clearTimeout(timeout))
    this.pendingMessages.clear()

    // Close the socket
    if (this.socket) {
      this.socket.close(1000, "Client disconnected")
      this.socket = null
    }

    this.connectionStatus = ConnectionStatus.DISCONNECTED
    this.notifyStatusChange()

    // Notify handlers of disconnect
    this.notifyHandlers({
      type: WebSocketMessageType.DISCONNECT,
      payload: { status: "disconnected" },
      timestamp: Date.now(),
      id: uuidv4(),
    })
  }

  /**
   * Get the current connection status
   * @returns The current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  /**
   * Register a handler for a specific message type
   * @param type - The message type to handle
   * @param handler - The handler function
   */
  public on(type: WebSocketMessageType, handler: (message: WebSocketMessage) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }

    this.messageHandlers.get(type)?.push(handler)
  }

  /**
   * Remove a handler for a specific message type
   * @param type - The message type
   * @param handler - The handler function to remove
   */
  public off(type: WebSocketMessageType, handler: (message: WebSocketMessage) => void): void {
    if (!this.messageHandlers.has(type)) {
      return
    }

    const handlers = this.messageHandlers.get(type) || []
    const index = handlers.indexOf(handler)

    if (index !== -1) {
      handlers.splice(index, 1)
    }
  }

  /**
   * Register a handler for connection status changes
   * @param handler - The handler function
   */
  public onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    const statusHandler = (message: WebSocketMessage) => {
      if (message.type === WebSocketMessageType.CONNECT) {
        handler(ConnectionStatus.CONNECTED)
      } else if (message.type === WebSocketMessageType.DISCONNECT) {
        handler(ConnectionStatus.DISCONNECTED)
      } else if (message.type === WebSocketMessageType.AUTH_SUCCESS) {
        handler(ConnectionStatus.AUTHENTICATED)
      } else if (message.type === WebSocketMessageType.AUTH_FAILURE) {
        handler(ConnectionStatus.ERROR)
      }
    }

    // Register for relevant message types
    this.on(WebSocketMessageType.CONNECT, statusHandler)
    this.on(WebSocketMessageType.DISCONNECT, statusHandler)
    this.on(WebSocketMessageType.AUTH_SUCCESS, statusHandler)
    this.on(WebSocketMessageType.AUTH_FAILURE, statusHandler)

    // Return a function to unregister the handler
    return () => {
      this.off(WebSocketMessageType.CONNECT, statusHandler)
      this.off(WebSocketMessageType.DISCONNECT, statusHandler)
      this.off(WebSocketMessageType.AUTH_SUCCESS, statusHandler)
      this.off(WebSocketMessageType.AUTH_FAILURE, statusHandler)
    }
  }

  /**
   * Send a message to the WebSocket server
   * @param type - The message type
   * @param payload - The message payload
   * @param timeoutMs - Optional timeout in milliseconds
   * @returns Promise that resolves with the response message
   */
  public async sendMessage<T, R>(
      type: WebSocketMessageType,
      payload: T,
      timeoutMs = 30000,
  ): Promise<WebSocketMessage<R>> {
    if (
        !this.socket ||
        (this.connectionStatus !== ConnectionStatus.CONNECTED && this.connectionStatus !== ConnectionStatus.AUTHENTICATED)
    ) {
      try {
        await this.connect()
      } catch (error) {
        console.error("WebSocket connection error:", error)
        throw new Error("Failed to connect to WebSocket server")
      }
    }

    return new Promise((resolve, reject) => {
      try {
        // Generate a unique message ID
        const messageId = uuidv4()
        this.lastMessageId = messageId

        // Create the message
        const message: WebSocketMessage = {
          type,
          payload,
          timestamp: Date.now(),
          id: messageId,
        }

        // Set a timeout for the message
        const timeout = setTimeout(() => {
          // Remove the pending message
          this.pendingMessages.delete(messageId)
          reject(new Error(`WebSocket message timeout: ${type}`))
        }, timeoutMs)

        // Store the pending message
        this.pendingMessages.set(messageId, { resolve, reject, timeout })

        // Send the message
        this.socket?.send(JSON.stringify(message))
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Send a payment request via WebSocket
   * @param paymentData - The payment data to send
   * @returns Promise that resolves with the payment result
   */
  public async sendPaymentRequest(paymentData: PaymentRequestPayload): Promise<unknown> {
    try {
      const response = await this.sendMessage(WebSocketMessageType.PAYMENT_REQUEST, paymentData)

      return response.payload
    } catch (error) {
      console.error("[WebSocketService] Payment request error:", error)
      throw error
    }
  }

  /**
   * Send a divination request via WebSocket
   * @param divinationData - The divination data to send
   * @returns Promise that resolves with the divination result
   */
  public async sendDivinationRequest(divinationData: DivinationRequestPayload): Promise<unknown> {
    try {
      const response = await this.sendMessage(WebSocketMessageType.DIVINATION_REQUEST, divinationData)

      return response.payload
    } catch (error) {
      console.error("[WebSocketService] Divination request error:", error)
      throw error
    }
  }

  /**
   * Handle WebSocket open event
   * @param resolve - Promise resolve function
   */
  private handleOpen(resolve: (value: boolean) => void): void {
    console.log("[WebSocketService] WebSocket connected")
    this.connectionStatus = ConnectionStatus.CONNECTED
    this.notifyStatusChange()
    this.reconnectAttempts = 0

    // Send connect message
    const connectMessage: WebSocketMessage<ConnectPayload> = {
      type: WebSocketMessageType.CONNECT,
      payload: {
        clientId: this.clientId,
        version: "1.0.0",
      },
      timestamp: Date.now(),
      id: uuidv4(),
    }

    this.socket?.send(JSON.stringify(connectMessage))

    // Start heartbeat
    this.startHeartbeat()

    // Notify handlers of connect
    this.notifyHandlers({
      type: WebSocketMessageType.CONNECT,
      payload: { status: "connected" },
      timestamp: Date.now(),
      id: uuidv4(),
    })

    resolve(true)
  }

  /**
   * Handle WebSocket message event
   * @param event - The message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage
      console.log("[WebSocketService] Received message:", message.type)

      // Update last message ID
      this.lastMessageId = message.id

      // Check if this is a response to a pending message
      if (message.id && this.pendingMessages.has(message.id)) {
        const { resolve, timeout } = this.pendingMessages.get(message.id)!
        clearTimeout(timeout)
        this.pendingMessages.delete(message.id)
        resolve(message)
      }

      // Notify handlers
      this.notifyHandlers(message)
    } catch (error) {
      console.error("[WebSocketService] Error parsing message:", error, event.data)
    }
  }

  /**
   * Handle WebSocket close event
   * @param event - The close event
   * @param reject - Promise reject function
   */
  private handleClose(event: CloseEvent, reject: (reason: Error) => void): void {
    console.log(`[WebSocketService] WebSocket closed: ${event.code} ${event.reason}`)

    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    // If this was an intentional close, don't reconnect
    if (event.code === 1000) {
      this.connectionStatus = ConnectionStatus.DISCONNECTED
      this.notifyStatusChange()
      reject(new Error(`WebSocket closed: ${event.code} ${event.reason}`))
      return
    }

    this.connectionStatus = ConnectionStatus.RECONNECTING
    this.notifyStatusChange()

    // Attempt to reconnect
    this.attemptReconnect(reject)
  }

  /**
   * Handle WebSocket error event
   * @param event - The error event
   * @param reject - Promise reject function
   */
  private handleError(event: Event, reject: (reason: Error) => void): void {
    console.error("[WebSocketService] WebSocket error:", event)
    this.connectionStatus = ConnectionStatus.ERROR
    this.notifyStatusChange()

    // Attempt to reconnect
    this.attemptReconnect(reject)
  }

  /**
   * Attempt to reconnect to the WebSocket server
   * @param reject - Promise reject function
   */
  private attemptReconnect(reject: (reason: Error) => void): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocketService] Max reconnect attempts reached")
      this.connectionStatus = ConnectionStatus.ERROR
      this.notifyStatusChange()
      reject(new Error("Max reconnect attempts reached"))
      return
    }

    this.reconnectAttempts++
    console.log(
        `[WebSocketService] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    )

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("[WebSocketService] Reconnect failed:", error)
      })
    }, this.reconnectTimeout)
  }

  /**
   * Start sending heartbeat messages
   */
  private startHeartbeat(): void {
    // Clear existing heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    // Start new heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      if (
          this.socket &&
          (this.connectionStatus === ConnectionStatus.CONNECTED ||
              this.connectionStatus === ConnectionStatus.AUTHENTICATED)
      ) {
        const heartbeatMessage: WebSocketMessage<HeartbeatPayload> = {
          type: WebSocketMessageType.HEARTBEAT,
          payload: {
            clientId: this.clientId,
            lastMessageId: this.lastMessageId,
          },
          timestamp: Date.now(),
          id: uuidv4(),
        }

        this.socket.send(JSON.stringify(heartbeatMessage))
      }
    }, ApiConfig.websocket.heartbeatInterval)
  }

  /**
   * Notify all registered handlers for a specific message type
   * @param message - The message to handle
   */
  private notifyHandlers(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || []

    handlers.forEach((handler) => {
      try {
        handler(message)
      } catch (error) {
        console.error(`[WebSocketService] Error in handler for ${message.type}:`, error)
      }
    })
  }

  /**
   * Notify status change handlers
   */
  private notifyStatusChange(): void {
    // Dispatch a custom event for status change
    if (typeof window !== "undefined") {
      const event = new CustomEvent("websocket-status-change", {
        detail: { status: this.connectionStatus },
      })
      window.dispatchEvent(event)
    }
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService()
