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
  
  try {
    console.log("[GenerateAlert] Starting for:", ticker, company, price, "sentiment:", sentiment)

    const input = `You are a factual financial summarizer. 
Task: Write a ≤90-word educational update for ${company} (${ticker}) trading at ${price}.
Sentiment goal: ${sentiment}. DO NOT use the words positive, negative, bullish, bearish, favorable, cautious, optimistic, pessimistic.

Step 1 – Selection rules:
- Gather news from the last ${windowDays} days via web search.
- Classify each item as:
  +1 = positive drivers (contracts won, capacity added, partnerships, revenue growth, regulatory approval)
  -1 = negative drivers (executive exits, delays, losses, financing dilution, legal issues, guidance cuts)
  0 = neutral (routine filings, small operational updates).
- Choose 2–3 items whose classification sum is most aligned with the sentiment goal.
  - For positive: choose +1 items if available.
  - For negative: choose -1 items if available.

Step 2 – Compose the summary:
- One sentence stating ${company} (${ticker}) trades near ${price}.
- Two to three factual items with date + source link in brackets [Source YYYY-MM-DD].
- One line "Why this matters:" explaining the directional context (e.g., growth momentum vs. financial pressure).
- End with: "Educational market research. Not investment advice."

Rules:
- Use neutral verbs: announced, reported, filed, completed, disclosed.
- Do not include any predictions, targets, or advice language.
- If fewer than 2 items match sentiment, state "No qualifying recent items in the past ${windowDays} days."`

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
