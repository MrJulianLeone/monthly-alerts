"use server"

import OpenAI from "openai"

// Fresh client instance
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Validator function
const FORBIDDEN = /\b(open|intraday|high|low|52-?week|range|previous close|market cap|float|beta|volume)\b/i
const HAS_TITLE_OR_LIST = /^(#|##|\*|-|\d+\.)/m
const OVER_1_PARA = /\n{2,}/

function violates(text: string) {
  if (HAS_TITLE_OR_LIST.test(text)) return 'structure'
  if (OVER_1_PARA.test(text)) return 'paras'
  
  // Allow forbidden tokens only if same sentence has a citation bracket
  const sentences = text.split(/(?<=[.!?])\s+/)
  for (const s of sentences) {
    const hasBad = FORBIDDEN.test(s)
    const hasCite = /\[[^\]]+\d{4}-\d{2}-\d{2}\]/.test(s)
    if (hasBad && !hasCite) return 'ohlc'
  }
  return null
}

export async function generateAlert(
  ticker: string,
  company: string,
  price: string,
  sentiment: "positive" | "negative"
) {
  try {
    console.log("[GenerateAlert] Starting with sentiment:", sentiment, "for:", ticker)

    // Get current month and year
    const now = new Date()
    const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Build the user prompt with variables
    const userPrompt = `Generate a newsletter-style company alert for ${company} (${ticker}), currently trading near ${price}. Search the web for up-to-date company and market data before writing.

Format:

**Monthly Alerts Insight – ${monthYear}**
### ${company} (${ticker}): [Short Headline Reflecting Sentiment]
**Price:** ${price} | **Sector:** [detected industry]

**Summary:** One paragraph summarizing business, key financial results, and recent performance in the tone of ${sentiment}.
**Recent Developments:** 2–3 bullet points with the latest corporate or market updates.
**Why It Matters:** One concise line connecting the developments to investor or market implications.

Write in under 180 words. No recommendations.`

    // Retry logic - up to 2 attempts
    for (let attempt = 0; attempt < 2; attempt++) {
      console.log(`[GenerateAlert] Attempt ${attempt + 1}/2`)
      
      const response = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an equity research writer for a stock alert newsletter. Your job is to produce short, factual company reports using verified web data. Each report should start with a one-sentence description of the company's business, then summarize recent news and performance. The tone should match the sentiment variable (Positive or Negative) but remain professional and data-driven. No investment advice, price targets, or speculation."
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.4,
        tools: [
          {
            type: "web_search",
            name: "default"
          }
        ]
      })

      const out = response.choices?.[0]?.message?.content?.trim()

      if (!out || out.length < 20) {
        console.log("[GenerateAlert] Empty or too short output, retrying...")
        continue
      }

      // Success!
      console.log("[GenerateAlert] Generated successfully with GPT-5")
      
      const sentimentLabel = sentiment === "positive" ? "Positive Alert" : "Negative Alert"
      const subject = `${company} (${ticker}) - ${sentimentLabel}`

      return {
        success: true,
        subject,
        content: out,
      }
    }

    // Both attempts failed
    return {
      error: `Unable to generate valid alert for ${ticker} after 2 attempts. Try again.`,
    }
  } catch (error: any) {
    console.error("[GenerateAlert] Error:", error)
    return {
      error: error.message || "Failed to generate alert.",
    }
  }
}