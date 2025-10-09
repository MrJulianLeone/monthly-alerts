"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MousePointerClick } from "lucide-react"
import { CampaignStats } from "@/app/actions/campaign"

interface AdminCampaignsTableProps {
  campaigns: CampaignStats[]
}

export default function AdminCampaignsTable({ campaigns }: AdminCampaignsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalHits = campaigns.reduce((sum, campaign) => sum + campaign.total_hits, 0)

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Campaign Leads</h2>
          <p className="text-sm text-muted-foreground">
            Track visitor counts for all active campaigns
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {totalHits} Total Hits
        </Badge>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MousePointerClick className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No campaign visits yet</p>
          <p className="text-xs mt-2">
            Share campaign URLs like: monthlyalerts.com/campaign/1
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="pb-3 pr-4">Campaign ID</th>
                <th className="pb-3 pr-4">Campaign URL</th>
                <th className="pb-3 pr-4">Total Hits</th>
                <th className="pb-3">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.campaign_source} className="border-b border-border/50">
                  <td className="py-4 pr-4">
                    <span className="font-mono font-semibold text-sm">
                      #{campaign.campaign_source}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      monthlyalerts.com/campaign/{campaign.campaign_source}
                    </code>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge variant="default" className="bg-primary">
                      {campaign.total_hits} {campaign.total_hits === 1 ? 'hit' : 'hits'}
                    </Badge>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {formatDate(campaign.last_visit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

