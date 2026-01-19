"use server"

import { deleteCampaignLeads } from "@/app/actions/campaign"

export async function deleteCampaign(campaignSource: string) {
  return await deleteCampaignLeads(campaignSource)
}
