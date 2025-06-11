// app/page.tsx
import type { Metadata } from "next"
import HomeClient from "./home-client"

export const metadata: Metadata = {
  title: "Witch Blog | Divination",
  description: "Discover your future through our mystical tarot divination",
}

export default function Page() {
  return <HomeClient />
}
