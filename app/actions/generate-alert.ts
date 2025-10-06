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
  try {
    console.log("[GenerateAlert] Starting for:", ticker, company, price, sentiment)

    const input = `Summarize the last 30 days of news for ${company} (ticker: ${ticker}) currently trading at ${price}.

Write a 90-word market update following these rules:
- Do NOT use words like: positive, negative, bullish, bearish, favorable, cautious, optimistic
- No predictions, targets, or advice words: buy, sell, should, recommend
- Use neutral verbs: reported, filed, announced, completed
- Cite 2-3 specific recent news items with dates
- Mention current price once
- Keep factual and educational tone

Structure:
- Opening sentence with current price
- 2-3 brief factual points about recent news (with dates)
- One line: "Why this matters:" + neutral fact
- End with: "Educational market research. Not investment advice."

Keep under 90 words total.`

    const res = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search" }],
      input: input,
    })

    const generatedContent = res.output_text

    if (!generatedContent) {
      throw new Error("No content generated")
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
