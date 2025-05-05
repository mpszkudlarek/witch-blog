const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1"
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000")

// WebSocket configuration
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8080/ws"
const WS_RECONNECT_ATTEMPTS = Number(process.env.NEXT_PUBLIC_WS_RECONNECT_ATTEMPTS || "5")
const WS_RECONNECT_INTERVAL = Number(process.env.NEXT_PUBLIC_WS_RECONNECT_INTERVAL || "3000")
const WS_HEARTBEAT_INTERVAL = Number(process.env.NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL || "30000")

// Feature flags - default to mock data until backend is ready
const USE_WEBSOCKETS = process.env.NEXT_PUBLIC_USE_WEBSOCKETS === "true"
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" // Default to true

// Export configuration as a single object
export const ApiConfig = {
  api: {
    baseUrl: API_BASE_URL,
    version: API_VERSION,
    timeout: API_TIMEOUT,
    endpoints: {
      auth: "/auth",
      divination: "/divination",
      payment: "/payment",
      history: "/history",
    },
  },
  websocket: {
    baseUrl: WS_BASE_URL,
    reconnectAttempts: WS_RECONNECT_ATTEMPTS,
    reconnectInterval: WS_RECONNECT_INTERVAL,
    heartbeatInterval: WS_HEARTBEAT_INTERVAL,
  },
  features: {
    useWebSockets: USE_WEBSOCKETS,
    useMockData: USE_MOCK_DATA,
  },
}
