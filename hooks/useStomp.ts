import { useEffect, useRef, useCallback } from "react"
import SockJS from "sockjs-client"
import { Client, IMessage } from "@stomp/stompjs"
import type { FrontendEvent } from "@/types/events"

export type OnMessageCallback = (payload: FrontendEvent) => void

export function useStomp(
    userId: string,
    processId: string,
    onMessage: OnMessageCallback
) {
    const clientRef = useRef<Client | null>(null)

    useEffect(() => {
        if (!userId || !processId || !onMessage) return

        // 🔒 Zapobiegaj wielokrotnej aktywacji
        if (clientRef.current?.connected || clientRef.current?.active) {
            console.log("[WS] Already connected — skipping")
            return
        }

        const socketUrl = `http://localhost:8083/ws?userId=${userId}&processId=${processId}`
        const socket = new SockJS(socketUrl, undefined, { transports: ["websocket"] })

        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log("[WS] " + str),
            reconnectDelay: 0, // 🔇 Wyłącz fallback loop

            onConnect: () => {
                console.log("✅ STOMP Connected")

                client.subscribe("/user/topic/messages", (message: IMessage) => {
                    try {
                        const parsed = JSON.parse(message.body)
                        onMessage(parsed as FrontendEvent)
                    } catch (err) {
                        console.error("❌ JSON parse error:", err)
                    }
                })

                client.publish({
                    destination: "/app/register",
                    body: JSON.stringify({}),
                    headers: { userId, processId },
                })
            },

            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame)
            },
        })

        client.activate()
        clientRef.current = client

        return () => {
            if (clientRef.current?.connected || clientRef.current?.active) {
                clientRef.current
                    .deactivate()
                    .then(() => console.log("🔌 STOMP Disconnected"))
                    .catch((err) => console.warn("Failed to deactivate STOMP:", err))
            }
        }
    }, [userId, processId, onMessage])

    const send = useCallback(
        (destination: string, payload: unknown) => {
            if (clientRef.current?.connected) {
                clientRef.current.publish({
                    destination,
                    body: JSON.stringify(payload),
                    headers: { userId, processId },
                })
            } else {
                console.warn("STOMP client not connected")
            }
        },
        [userId, processId]
    )

    return { send }
}
