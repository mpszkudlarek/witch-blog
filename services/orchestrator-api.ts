// services/orchestrator-api.ts
import type { DivinationFormData } from "@/types"

export async function startDivinationProcess(userId: string, formData: DivinationFormData) {
    const url = `http://localhost:8080/orchestrator-service/process/${userId}`

    console.log("🔮 Sending divination request to:", url)
    console.log("📦 With body:", formData)

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    })

    if (!res.ok) {
        const errorText = await res.text()
        console.error("❌ Backend error response:", errorText)
        throw new Error("Failed to start divination process")
    }

    const json = await res.json()
    console.log("✅ Received response:", json)

    return json
}
