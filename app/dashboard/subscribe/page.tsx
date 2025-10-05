import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import SubscribeClient from "./subscribe-client"

export default async function SubscribePage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return <SubscribeClient userId={session.user_id} userEmail={session.email} />
}