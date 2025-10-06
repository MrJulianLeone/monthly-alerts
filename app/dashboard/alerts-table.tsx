"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Lock, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

interface Alert {
  id: string
  ticker: string
  company_name: string
  price: string
  sentiment: string
  sent_at: string
  content: string
  subject: string
}

interface AlertsTableProps {
  alerts: Alert[]
  userSignupDate: string
  isActive: boolean
}

export default function AlertsTable({ alerts, userSignupDate, isActive }: AlertsTableProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  // Find first alert sent after user signup
  const signupTime = new Date(userSignupDate).getTime()
  const alertsAfterSignup = alerts.filter(
    (alert) => new Date(alert.sent_at).getTime() > signupTime
  )
  const firstAlertId = alertsAfterSignup.length > 0 ? alertsAfterSignup[0].id : null

  // User can view an alert if:
  // 1. It's the first alert after their signup (free), OR
  // 2. They have an active subscription
  const canViewAlert = (alertId: string) => {
    return alertId === firstAlertId || isActive
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Stock Alerts</h2>
            <p className="text-sm text-muted-foreground">
              View all MonthlyAlerts sent to subscribers
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
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const canView = canViewAlert(alert.id)
                  const isFreeAlert = alert.id === firstAlertId

                  return (
                    <tr key={alert.id} className="border-b border-border/50">
                      <td className="py-4 pr-4 text-sm">
                        {formatDate(alert.sent_at)}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-mono font-semibold text-sm">
                          {alert.ticker}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-sm">
                        {alert.company_name}
                      </td>
                      <td className="py-4 pr-4 text-sm font-medium">
                        {alert.price}
                      </td>
                      <td className="py-4 pr-4">
                        {alert.sentiment === "positive" ? (
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Positive
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Negative
                          </Badge>
                        )}
                      </td>
                      <td className="py-4">
                        {canView ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAlert(alert)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {isFreeAlert && (
                              <Badge variant="secondary" className="text-xs">
                                Free
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Link href="/dashboard/subscribe">
                            <Button size="sm" variant="outline">
                              <Lock className="h-3 w-3 mr-1" />
                              Subscribe
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
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
                    <span>•</span>
                    <span className="font-mono font-semibold">
                      {selectedAlert.ticker}
                    </span>
                    <span>•</span>
                    <span>{selectedAlert.price}</span>
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

