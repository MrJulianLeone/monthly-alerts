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
  const windowDays = 30
  
  try {
    console.log("[GenerateAlert] Starting with sentiment:", sentiment, "for:", ticker)

    // Build the hardened prompt fresh each call - IDENTICAL for both sentiments
    const prompt = `You are a factual markets writer.

Goal: one paragraph ≤90 words about ${company} (${ticker}) at $${price}.
Use ONLY news from last ${windowDays} days. Cite 2–3 items inline as [Source YYYY-MM-DD] with links.
Do NOT include any market-data dump, headings, bullets, or sections.

Forbidden unless attached to a cited event sentence:
open, intraday, high, low, 52-week, range, previous close, change, market cap, float, beta, volume.

Rules:
- Mention price once.
- Neutral verbs: announced, reported, filed, completed, disclosed.
- No advice, predictions, targets, or sentiment words (positive/negative/bullish/bearish).
- If <2 qualifying items: output exactly "No qualifying recent items in the past ${windowDays} days."
- If your first token would be a heading or list marker, STOP and regenerate internally.

Sentiment lens: ${sentiment}
- If positive: emphasize benefits, opportunities, growth momentum
- If negative: emphasize challenges, risks, uncertainty

Output format: a single paragraph, no title, no list, no extra lines.
Do NOT add disclaimer - that will be added separately.`

    // Retry logic - up to 2 attempts
    for (let attempt = 0; attempt < 2; attempt++) {
      console.log(`[GenerateAlert] Attempt ${attempt + 1}/2`)
      
      const response = await client.responses.create({
        model: "gpt-4o-mini",
        tools: [{ 
          type: "web_search",
        }],
        input: prompt,
        temperature: 0.2, // Keep low to reduce drift
      })

      const out = response.output_text?.trim()

      if (!out || out.length < 20) {
        console.log("[GenerateAlert] Empty or too short output, retrying...")
        continue
      }

      // Validate output
      const validationError = violates(out)
      
      if (!validationError) {
        // Success!
        console.log("[GenerateAlert] Generated and validated successfully")
        console.log("[GenerateAlert] Citations:", response.output[0]?.content?.[0]?.annotations ?? [])
        
        const sentimentLabel = sentiment === "positive" ? "Positive Alert" : "Negative Alert"
        const subject = `${company} (${ticker}) - ${sentimentLabel}`

        return {
          success: true,
          subject,
          content: out,
        }
      }

      console.log(`[GenerateAlert] Validation failed: ${validationError}, retrying...`)
    }

    // Both attempts failed validation
    return {
      error: `Unable to generate valid alert for ${ticker} after 2 attempts. Try a different company.`,
    }
  } catch (error: any) {
    console.error("[GenerateAlert] Error:", error)
    return {
      error: error.message || "Failed to generate alert.",
    }
  }
}