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

    // Select prompt based on sentiment
    const input = sentiment === "positive" 
      ? `You are a factual financial summarizer.

Goal: Write a ≤90-word educational market update for ${company} (${ticker}) trading at ${price}.
Sentiment target: POSITIVE. 
Do NOT print words such as positive, negative, bullish, bearish, favorable, cautious, optimistic, or pessimistic.

Step 1 – Data selection rules
- Collect news from the last ${windowDays} days via web search.
- Keep only items that reflect constructive or growth-oriented developments:
  • new contracts or partnerships
  • project completions or capacity additions
  • financing or credit facilities on favorable terms
  • regulatory approvals or certifications
  • earnings improvements, revenue growth, or cost reductions
  • product launches or geographic expansion
- Exclude any items involving executive departures, losses, litigation, delays, layoffs, or missed guidance.
- If no clearly positive items exist, output exactly:
  "No qualifying recent positive developments in the past ${windowDays} days."

Step 2 – Compose summary
- One sentence: "${company} (${ticker}) trades near ${price}."
- Two factual items with source + date in brackets [Source YYYY-MM-DD].
- One line: "Why this matters:" stating a neutral reason for potential strength (e.g., revenue growth, operational expansion, strategic funding).
- End with: "Educational market research. Not investment advice."

Style rules
- Neutral verbs only: reported, filed, announced, disclosed, completed.
- No predictions, targets, or advice.
- If both positive and negative items appear, delete the negative ones.`
      : `You are a factual financial summarizer.

Goal: Write a ≤90-word educational market update for ${company} (${ticker}) trading at ${price}.
Sentiment target: NEGATIVE. 
Do NOT print words such as positive, negative, bullish, bearish, favorable, cautious, optimistic, or pessimistic.

Step 1 – Data selection rules
- Collect news from the last ${windowDays} days via web search.
- Keep only items that reflect setbacks or risks:
  • executive departures, financing dilution, losses, litigation, regulatory delays, missed guidance, cost overruns, layoffs, or operational issues.
- Exclude any items involving expansions, new contracts, partnerships, financings on favorable terms, or approvals.
- If no clearly negative items exist, output exactly:
  "No qualifying recent negative developments in the past ${windowDays} days."

Step 2 – Compose summary
- One sentence: "${company} (${ticker}) trades near ${price}."
- Two factual items with source + date in brackets [Source YYYY-MM-DD].
- One line: "Why this matters:" stating neutral reason for concern (e.g., leadership changes, financing strain).
- End with: "Educational market research. Not investment advice."

Style rules
- Neutral verbs only: reported, filed, announced, disclosed, completed.
- No predictions, targets, or advice.
- If both positive and negative items appear, delete the positive ones.`

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
