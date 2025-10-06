"use server"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAlert(
  ticker: string,
  company: string,
  price: string,
  sentiment: "positive" | "negative"
) {
  const windowDays = 30 // Hard-coded 30 day window
  const angle = sentiment === "positive" ? "good" : "bad"
  
  try {
    console.log("[GenerateAlert] Starting for:", ticker, company, price, "angle:", angle)

    const input = `Task: Write a ≤90-word EDUCATIONAL news update for ${company} (${ticker}) at ${price}.
Angle: ${angle}. Do NOT print these words or any of: positive, negative, bullish, bearish, favorable, cautious, optimistic.

Hard rules:
- Use ONLY items published in the last ${windowDays} days. If <2 items, output exactly:
  "No qualifying recent items in the past ${windowDays} days."
- No market data preamble. One paragraph only.
- Mention current price once.
- Include 2–3 dated facts with inline citations: [Source YYYY-MM-DD] with links.
- Neutral verbs only: reported, filed, announced, completed, disclosed.
- No advice, targets, predictions, or directives.

Content policy:
- Prefer SEC/IR, earnings, contracts, capacity changes, financings, regulatory actions.
- Exclude items older than the window, rumors, or undated blogs.

Structure (exactly):
${company} (${ticker}) trades near ${price}. {fact 1 with citation} {fact 2 with citation}{ optional fact 3 with citation}. 
Why this matters: {one neutral consequence}. 
Educational market research. Not investment advice.`

    const res = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search" }],
      input: input,
    })

    const generatedContent = res.output_text

    if (!generatedContent) {
      throw new Error("No content generated")
    }

    // Check if no qualifying items found
    if (generatedContent.includes("No qualifying recent items")) {
      return {
        error: `No recent news found for ${ticker} in the past ${windowDays} days. The AI searches for SEC filings, earnings, and official announcements. Try a company with recent news activity.`,
      }
    }

    console.log("[GenerateAlert] Generated successfully")
    console.log("[GenerateAlert] Sources:", res.output[0]?.content?.[0]?.annotations ?? res.citations ?? [])
    
    // Generate subject line
    const subject = `${company} (${ticker}) Market Update - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

    return {
      success: true,
      subject,
      content: generatedContent,
      sources: res.output[0]?.content?.[0]?.annotations ?? res.citations ?? [],
    }
  } catch (error: any) {
    console.error("[GenerateAlert] Error:", error)
    return {
      error: error.message || "Failed to generate alert. The AI may not have found sufficient recent news for this ticker.",
    }
  }
}
