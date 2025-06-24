import type {DivinationFormData} from "@/types"

export async function startDivinationProcess(userId: string, formData: DivinationFormData) {
    const url = `http://localhost:8080/orchestrator-service/process/${userId}`

    console.log("[ORCHESTRATOR] Starting divination process")
    console.log("[ORCHESTRATOR] POST", url)
    console.log("[ORCHESTRATOR] Payload", formData)

    const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
    })

    if (!res.ok) {
        const errorText = await res.text()
        console.error("[ORCHESTRATOR] Request failed:", errorText)
        throw new Error("Failed to start divination process")
    }

    const json = await res.json()
    console.log("[ORCHESTRATOR] Response received", json)

    return json
}
