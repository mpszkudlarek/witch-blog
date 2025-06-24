import type {AdminSummary} from "@/types/admin"

interface BackendResponse {
    profit: number
    totalUsedTokens: number
    totalPayments: number
}

const API_URL = "http://localhost:8080/management-service/profit"

async function parseResponse(res: Response): Promise<BackendResponse> {
    const data = await res.json()

    console.log("Received response:", data)

    if (!res.ok) {
        const errorText = `Request failed (status ${res.status})`
        throw new Error(errorText)
    }

    if (
        typeof data.profit !== "number" ||
        typeof data.totalUsedTokens !== "number" ||
        typeof data.totalPayments !== "number"
    ) {
        throw new Error("Invalid response structure")
    }

    return data
}

function transformToAdminSummary(
    data: BackendResponse,
    dateRange?: { from: string; to: string }
): AdminSummary {
    return {
        profit: data.profit,
        tokenUsage: data.totalUsedTokens,
        totalRevenue: data.totalPayments,
        dateRange,
    }
}

export const AdminService = {
    getAdminSummary: async (password: string): Promise<AdminSummary> => {
        try {
            console.log("Sending GET /management-service/profit")
            console.log("Headers:", {"X-Admin-Password": password})

            const res = await fetch(API_URL, {
                headers: {
                    "X-Admin-Password": password,
                },
            })

            const data = await parseResponse(res)
            return transformToAdminSummary(data)
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            console.error("AdminService.getAdminSummary failed:", msg)
            throw new Error(`getAdminSummary failed: ${msg}`)
        }
    },

    getAdminSummaryWithDates: async (
        password: string,
        fromDate: string,
        toDate: string
    ): Promise<AdminSummary> => {
        try {
            const url = new URL(API_URL)
            url.searchParams.append("startDate", fromDate)
            url.searchParams.append("endDate", toDate)

            console.log("Sending GET /management-service/profit with dates")
            console.log("Query:", {startDate: fromDate, endDate: toDate})
            console.log("Headers:", {"X-Admin-Password": password})

            const res = await fetch(url.toString(), {
                headers: {
                    "X-Admin-Password": password,
                },
            })

            const data = await parseResponse(res)
            return transformToAdminSummary(data, {from: fromDate, to: toDate})
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            console.error("AdminService.getAdminSummaryWithDates failed:", msg)
            throw new Error(`getAdminSummaryWithDates failed: ${msg}`)
        }
    },
}
