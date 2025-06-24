import {useEffect, useRef, useCallback} from "react"
import SockJS from "sockjs-client"
import {Client, IMessage} from "@stomp/stompjs"
import type {FrontendEvent} from "@/types/events"

export type OnMessageCallback = (payload: FrontendEvent) => void

export function useStomp(
    userId: string,
    processId: string,
    onMessage: OnMessageCallback
) {
    const clientRef = useRef<Client | null>(null)
    const onMessageRef = useRef<OnMessageCallback>(onMessage)

    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect(() => {
        console.log("[WS] useStomp mounted")

        if (!userId || !processId) {
            console.warn("[WS] userId or processId missing; skipping connection")
            return
        }

        if (clientRef.current?.connected || clientRef.current?.active) {
            console.log("[WS] Already connected; skipping activation")
            return
        }

        const socketUrl = `http://localhost:8083/ws?userId=${userId}&processId=${processId}`
        console.log(`[WS] Opening WebSocket at ${socketUrl}`)

        const socket = new SockJS(socketUrl, undefined, {transports: ["websocket"]})

        const client = new Client({
            webSocketFactory: () => socket,
            debug: (msg) => console.log(`[STOMP] ${msg}`),
            reconnectDelay: 0,

            onConnect: () => {
                console.log("[STOMP] Connected")

                client.subscribe("/user/topic/messages", (message: IMessage) => {
                    try {
                        const parsed = JSON.parse(message.body)
                        console.log("[STOMP] Received message", parsed)
                        onMessageRef.current(parsed as FrontendEvent)
                    } catch (err) {
                        console.error("[STOMP] Error parsing message", err)
                    }
                })

                client.publish({
                    destination: "/app/register",
                    body: JSON.stringify({}),
                    headers: {userId, processId},
                })

                console.log("[STOMP] Sent registration to /app/register")
            },

            onStompError: (frame) => {
                console.error("[STOMP] STOMP error", frame)
            },
        })

        client.activate()
        clientRef.current = client

        return () => {
            if (clientRef.current?.connected || clientRef.current?.active) {
                clientRef.current
                    .deactivate()
                    .then(() => console.log("[WS] Disconnected"))
                    .catch((err) => console.warn("[WS] Deactivation failed", err))
            }
        }
    }, [userId, processId])

    const send = useCallback(
        (destination: string, payload: unknown) => {
            if (clientRef.current?.connected) {
                console.log(`[STOMP] Sending to ${destination}`, payload)
                clientRef.current.publish({
                    destination,
                    body: JSON.stringify(payload),
                    headers: {userId, processId},
                })
            } else {
                console.warn("[STOMP] Client not connected; message not sent")
            }
        },
        [userId, processId]
    )

    return {send}
}
