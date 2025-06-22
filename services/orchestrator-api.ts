// services/orchestrator-api.ts
import type { DivinationFormData } from "@/types"

export async function startDivinationProcess(userId: string, formData: DivinationFormData) {
    const url = `http://localhost:8080/orchestrator-service/process/${userId}`

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    })

    if (!res.ok) throw new Error("Failed to start divination process")

    return res.json() // returns { id, userId, status, ... }
}
