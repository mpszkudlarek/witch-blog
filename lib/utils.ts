import { v4 as uuidv4 } from "uuid"

export const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem("userId")
  if (!userId) {
    userId = uuidv4()
    localStorage.setItem("userId", userId)
    console.log("Generated new userId:", userId)
  } else {
    console.log("Loaded existing userId:", userId)
  }
  return userId
}
