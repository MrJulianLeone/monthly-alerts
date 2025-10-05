import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import SubscribePage from "./page"

export default async function SubscribeWrapper() {
  const session = await getSession()
  if (!session) redirect("/login")

  // Pass session data as search params to client component
  return <SubscribePage searchParams={{ userId: session.user_id, email: session.email }} />
}
