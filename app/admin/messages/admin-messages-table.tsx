"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, MessageSquare } from "lucide-react"
import { deleteMessage } from "./delete-message-action"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  subject: string
  content: string
  sent_at: string
  recipient_count: number
}

interface AdminMessagesTableProps {
  messages: Message[]
}

export default function AdminMessagesTable({ messages }: AdminMessagesTableProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to permanently delete this message? This action cannot be undone.')) {
      return
    }

    setDeletingId(messageId)
    try {
      const result = await deleteMessage(messageId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete message')
      }
    } catch (error) {
      alert('Failed to delete message')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Sent Messages</h2>
            <p className="text-sm text-muted-foreground">
              Manage all messages sent to subscribers
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {messages.length} Total Messages
          </Badge>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No messages have been sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-3 pr-4">Date Sent</th>
                  <th className="pb-3 pr-4">Subject</th>
                  <th className="pb-3 pr-4">Recipients</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id} className="border-b border-border/50">
                    <td className="py-4 pr-4 text-sm">
                      {formatDate(message.sent_at)}
                    </td>
                    <td className="py-4 pr-4 text-sm font-medium">
                      {message.subject}
                    </td>
                    <td className="py-4 pr-4 text-sm">
                      {message.recipient_count}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(message.id)}
                          disabled={deletingId === message.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deletingId === message.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Message Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMessage(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedMessage.subject}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{formatDate(selectedMessage.sent_at)}</span>
                    <span>•</span>
                    <span>{selectedMessage.recipient_count} recipients</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedMessage.content}
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Disclaimer:</strong> This is educational market research and not
                  investment advice. All investment decisions should be made based on your own
                  research and consultation with qualified financial advisors. Past performance
                  does not guarantee future results.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

