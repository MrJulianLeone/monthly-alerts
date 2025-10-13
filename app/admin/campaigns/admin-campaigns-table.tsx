"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MousePointerClick, Edit2, Check, X } from "lucide-react"
import { CampaignStats, updateCampaignName } from "@/app/actions/campaign"

interface AdminCampaignsTableProps {
  campaigns: CampaignStats[]
}

function CampaignRow({ campaign }: { campaign: CampaignStats }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(campaign.campaign_name || "")
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateCampaignName(campaign.campaign_source, editName)
    setIsSaving(false)
    
    if (result.success) {
      setIsEditing(false)
      window.location.reload() // Reload to show updated name
    } else {
      alert(result.error || "Failed to update campaign name")
    }
  }

  const handleCancel = () => {
    setEditName(campaign.campaign_name || "")
    setIsEditing(false)
  }

  const displayName = campaign.campaign_name || `Campaign #${campaign.campaign_source}`

  return (
    <tr className="border-b border-border/50">
      <td className="py-4 pr-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={`Campaign #${campaign.campaign_source}`}
              className="h-8 text-sm max-w-[200px]"
              disabled={isSaving}
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{displayName}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        )}
        <span className="text-xs text-muted-foreground block mt-1">ID: {campaign.campaign_source}</span>
      </td>
      <td className="py-4 pr-4 text-sm hidden md:table-cell">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          monthlyalerts.com/campaign/{campaign.campaign_source}
        </code>
      </td>
      <td className="py-4 pr-4">
        <Badge variant="default" className="bg-primary">
          {campaign.total_hits} {campaign.total_hits === 1 ? 'hit' : 'hits'}
        </Badge>
      </td>
      <td className="py-4 pr-4">
        <Badge variant="secondary" className="bg-accent">
          {campaign.today_hits} {campaign.today_hits === 1 ? 'hit' : 'hits'}
        </Badge>
      </td>
      <td className="py-4 text-sm text-muted-foreground">
        {formatDate(campaign.last_visit)}
      </td>
    </tr>
  )
}

export default function AdminCampaignsTable({ campaigns }: AdminCampaignsTableProps) {
  const totalHits = campaigns.reduce((sum, campaign) => sum + campaign.total_hits, 0)
  const todayHits = campaigns.reduce((sum, campaign) => sum + campaign.today_hits, 0)

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Campaign Leads</h2>
          <p className="text-sm text-muted-foreground">
            Track visitor counts for all active campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {todayHits} Today
          </Badge>
          <Badge variant="outline" className="text-xs">
            {totalHits} Total
          </Badge>
        </div>
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
                <th className="pb-3 pr-4">Campaign Name</th>
                <th className="pb-3 pr-4 hidden md:table-cell">Campaign URL</th>
                <th className="pb-3 pr-4">Total Hits</th>
                <th className="pb-3 pr-4">Today&apos;s Hits</th>
                <th className="pb-3">Last Visit</th>
              </tr>
            </thead>
            <tbody className="group">
              {campaigns.map((campaign) => (
                <CampaignRow key={campaign.campaign_source} campaign={campaign} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

