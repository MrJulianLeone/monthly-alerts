"use server"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAlert(
  ticker: string,
  company: string,
  price: string,
  sentiment: "positive" | "negative",
  windowDays: number = 7
) {
  try {
    console.log("[GenerateAlert] Starting for:", ticker, company, price, sentiment, "windowDays:", windowDays)

    const prompt = `You are a factual markets writer.

Goal: Write a 90-word update about ${company} (${ticker}) at ${price}.
Do NOT restate the sentiment label. Do NOT use words like positive, negative, bullish, bearish, favorable, cautious.

Evidence requirement:
- Use only news published in the last ${windowDays} days.
- Include 2–3 specific items with date and source, each linked.
- Prefer company 8-K/10-Q/press releases, earnings, guidance, contracts, regulatory items.
- If fewer than 2 qualifying items exist, output: "No qualifying recent items in the past ${windowDays} days." and STOP.

Structure (exactly):
Headline: one factual clause (no adjectives).
Body (≤90 words): 
 • Current price mention once.
 • 2–3 evidence bullets: [YYYY-MM-DD] Source — headline (link).
 • One neutral relevance line ("Why this matters:" + fact).
Footer: Educational market research. Not investment advice.

Style rules:
- No advice, predictions, targets, or directives.
- No generic phrases ("growing demand," "investor interest").
- Quantify when possible (dates, amounts, %).
- Use neutral verbs: "reported," "filed," "announced," "completed."

Inputs:
ticker=${ticker}
company=${company}
price=${price}
window_days=${windowDays}
sentiment_label=${sentiment}  # for angle selection ONLY; never print this word.

Return BOTH:
1) The email text.
2) A JSON block:
{
  "ticker": "${ticker}",
  "timestamp_utc": "...",
  "sources": [
    {"title":"...", "url":"...", "date":"YYYY-MM-DD"},
    ...
  ]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a factual markets writer who creates evidence-based, educational market updates with specific citations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error("No content generated")
    }

    // Check if no qualifying items
    if (generatedContent.includes("No qualifying recent items")) {
      return {
        error: `No recent news found for ${ticker} in the past ${windowDays} days. Try increasing the time window or selecting a different company.`,
      }
    }

    console.log("[GenerateAlert] Generated successfully")
    
    // Generate subject line
    const subject = `${company} (${ticker}) Market Update - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

    return {
      success: true,
      subject,
      content: generatedContent,
    }
  } catch (error: any) {
    console.error("[GenerateAlert] Error:", error)
    return {
      error: error.message || "Failed to generate alert",
    }
  }
}
