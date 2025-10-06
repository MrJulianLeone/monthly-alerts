"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { deleteAlert } from "./delete-alert-action"
import { useRouter } from "next/navigation"

interface Alert {
  id: string
  ticker: string
  company_name: string
  price: string
  sentiment: string
  sent_at: string
  content: string
  subject: string
  recipient_count: number
}

interface AdminAlertsTableProps {
  alerts: Alert[]
}

export default function AdminAlertsTable({ alerts }: AdminAlertsTableProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
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

  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to permanently delete this alert? This action cannot be undone.')) {
      return
    }

    setDeletingId(alertId)
    try {
      const result = await deleteAlert(alertId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete alert')
      }
    } catch (error) {
      alert('Failed to delete alert')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Sent Alerts</h2>
            <p className="text-sm text-muted-foreground">
              Manage all stock alerts sent to subscribers
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {alerts.length} Total Alerts
          </Badge>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No alerts have been sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-3 pr-4">Date Sent</th>
                  <th className="pb-3 pr-4">Ticker</th>
                  <th className="pb-3 pr-4">Company</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Sentiment</th>
                  <th className="pb-3 pr-4">Recipients</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-border/50">
                    <td className="py-4 pr-4 text-sm">
                      {formatDate(alert.sent_at)}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="font-mono font-semibold text-sm">
                        {alert.ticker || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm">
                      {alert.company_name || 'N/A'}
                    </td>
                    <td className="py-4 pr-4 text-sm font-medium">
                      {alert.price || 'N/A'}
                    </td>
                    <td className="py-4 pr-4">
                      {alert.sentiment === "positive" ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Positive
                        </Badge>
                      ) : alert.sentiment === "negative" ? (
                        <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Negative
                        </Badge>
                      ) : (
                        <Badge variant="outline">N/A</Badge>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-sm">
                      {alert.recipient_count}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(alert.id)}
                          disabled={deletingId === alert.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deletingId === alert.id ? 'Deleting...' : 'Delete'}
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

      {/* Alert Modal */}
      {selectedAlert && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAlert(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedAlert.subject}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{formatDate(selectedAlert.sent_at)}</span>
                    {selectedAlert.ticker && (
                      <>
                        <span>•</span>
                        <span className="font-mono font-semibold">
                          {selectedAlert.ticker}
                        </span>
                      </>
                    )}
                    {selectedAlert.price && (
                      <>
                        <span>•</span>
                        <span>{selectedAlert.price}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{selectedAlert.recipient_count} recipients</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedAlert.content}
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

