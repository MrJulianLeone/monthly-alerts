"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cancelSubscription } from "@/app/actions/subscription"

export function CancelSubscriptionForm({ subscriptionId }: { subscriptionId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("subscriptionId", subscriptionId)

    try {
      const result = await cancelSubscription(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
      } else if (result.success) {
        // Redirect to dashboard on success
        router.push("/dashboard?canceled=true")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
          {error}
        </div>
      )}
      <Button type="submit" variant="destructive" disabled={isLoading}>
        {isLoading ? "Canceling..." : "Cancel Subscription"}
      </Button>
    </form>
  )
}

