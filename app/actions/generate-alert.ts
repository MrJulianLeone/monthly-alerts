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

    const input = `Task: Write a ≤90-word educational update about ${company} (${ticker}) at ${price}.
Sentiment: ${sentiment}. DO NOT print this word or synonyms.

Selection rules:
1) Gather news last ${windowDays} days via web search. Keep max 8 items.
2) Score each item:
   +1 = constructive (contracts won, guidance up, financing on good terms, capacity online, regulatory approval, major partner)
   -1 = adverse (delays, guidance down, layoffs, litigation/regulatory action, dilutive financing, missed targets)
   0  = neutral (procedural filings, minor mentions).
3) Choose the top 2–3 items that maximize the sum toward the target sentiment:
   - If Sentiment=positive: prefer items with +1; break ties by recency.
   - If Sentiment=negative: prefer items with -1; break ties by recency.
   - If <2 items match, fill with 0-score items but keep tone neutral.
4) Do not include price/volume dumps unless tied to a cited event.

Output format (exactly one paragraph):
${company} (${ticker}) trades near ${price}. {fact1 with inline citation [Source YYYY-MM-DD]} {fact2 with citation}{ optional fact3 with citation}. 
Why this matters: {one neutral consequence}. 
Educational market research. Not investment advice.

Style constraints:
- No words: positive, negative, bullish, bearish, favorable, cautious, optimistic, pessimistic.
- Neutral verbs only: reported, filed, announced, completed, disclosed.
- Mention price once. No predictions, targets, advice, or directives.
- If <2 qualifying recent items exist, output exactly:
  "No qualifying recent items in the past ${windowDays} days."`

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
