"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteUser } from "./delete-user-action"

interface DeleteUserButtonProps {
  userId: string
  isAdmin: boolean
}

export default function DeleteUserButton({ userId, isAdmin }: DeleteUserButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await deleteUser(userId)
      
      if (result.error) {
        alert(result.error)
      } else if (result.success) {
        // The page will automatically refresh due to revalidatePath
      }
    } catch (error) {
      alert("An unexpected error occurred")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (isAdmin) {
    return (
      <Button variant="ghost" size="sm" disabled title="Cannot delete admin users">
        <Trash2 className="h-4 w-4" />
      </Button>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Confirm"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

