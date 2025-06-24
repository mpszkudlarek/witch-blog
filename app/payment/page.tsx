import type {Metadata} from "next"
import PaymentClient from "./payment-client"

export const metadata: Metadata = {
    title: "Payment | Witch Blog",
    description: "Complete your payment to receive your divination",
}

export default function PaymentPage() {
    return <PaymentClient/>
}
