"use server"

import OpenAI from "openai"

// Fresh client instance - no shared state
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAlert(
  ticker: string,
  company: string,
  price: string,
  sentiment: "positive" | "negative"
) {
  try {
    console.log("[GenerateAlert] Fresh generation for:", ticker, company, price, "sentiment:", sentiment)

    // Build the full prompt fresh each call — no reused variables or context
    const prompt = `You are a neutral financial writer.

Task: Write a ≤90-word educational market update about ${company} (${ticker}) trading at $${price}.
Sentiment lens: ${sentiment}. Do NOT use those words explicitly.

Instructions:
1. Search for news about ${company} from the last 30 days
2. Find 2-3 specific factual items (earnings, contracts, filings, announcements)
3. Interpret facts through the selected lens:
   - If sentiment = positive → emphasize potential benefits, opportunities, improvements, or strategic rationale
   - If sentiment = negative → emphasize challenges, risks, costs, leadership uncertainty, or financial strain
4. Do not invent or alter facts
5. Keep impersonal, factual, and concise
6. Mention current price once
7. Add one closing statement that supports the ${sentiment} sentiment
8. End with: "Educational market research. Not investment advice."

Avoid words: buy, sell, should, recommend, bullish, bearish, optimistic, pessimistic, positive, negative.
Use neutral verbs: announced, reported, disclosed, completed, filed.

Format:
${company} (${ticker}) trades near $${price}. [News item 1 with date]. [News item 2 with date]. [One statement supporting ${sentiment} perspective based on the facts]. Educational market research. Not investment advice.`

    // Fresh API call — no history or memory
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search" }],
      input: prompt,
    })

    const generatedContent = response.output_text

    if (!generatedContent || generatedContent.length < 20) {
      return {
        error: `Unable to generate alert for ${ticker}. The AI may not have found sufficient recent news.`,
      }
    }

    console.log("[GenerateAlert] Generated successfully")
    console.log("[GenerateAlert] Citations:", response.output[0]?.content?.[0]?.annotations ?? [])
    
    // Generate subject line fresh
    const subject = `${company} (${ticker}) Market Update - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

    return {
      success: true,
      subject,
      content: generatedContent,
    }
  } catch (error: any) {
    console.error("[GenerateAlert] Error:", error)
    return {
      error: error.message || "Failed to generate alert.",
    }
  }
}
