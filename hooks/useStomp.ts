// hooks/useStomp.ts
import { useEffect, useRef } from "react"
import SockJS from "sockjs-client"
import { Client, IMessage } from "@stomp/stompjs"

type OnMessageCallback = (payload: unknown) => void

export function useStomp(userId: string, processId: string, onMessage: OnMessageCallback) {
    const clientRef = useRef<Client | null>(null)

    useEffect(() => {
        const socketUrl = `http://localhost:8083/ws?userId=${userId}&processId=${processId}`
        const socket = new SockJS(socketUrl)

        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log("[WS] " + str),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ STOMP Connected")

                client.subscribe("/user/topic/messages", (message: IMessage) => {
                    try {
                        const parsed = JSON.parse(message.body)
                        onMessage(parsed)
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
            if (clientRef.current?.active) {
                clientRef.current.deactivate()
                console.log("🔌 STOMP Disconnected")
            }
        }
    }, [userId, processId, onMessage])
}
