export interface AdminSummary {
    totalRevenue: number
    tokenUsage: number
    profit: number
    dateRange?: {
        from: string
        to: string
    }
}
