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

    // First, gather recent news via web search
    const newsGatherPrompt = `Search for news about ${company} (ticker: ${ticker}) from the last ${windowDays} days.
Find 3-5 specific items from:
- SEC filings (8-K, 10-Q, press releases)
- Earnings announcements
- Major contracts or partnerships
- Regulatory actions
- Leadership changes
- Financial transactions

List each item with: [Date YYYY-MM-DD] Source - Brief headline`

    const newsRes = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search" }],
      input: newsGatherPrompt,
    })

    const newsItems = newsRes.output_text

    if (!newsItems || newsItems.length < 20) {
      return {
        error: `No recent news found for ${ticker}. Try a different company with recent activity.`,
      }
    }

    console.log("[GenerateAlert] Found news items, now formatting with sentiment lens...")

    // Now format with sentiment lens
    const input = `You are a neutral financial writer.

Task: Write a ≤90-word educational update about ${company} (${ticker}) trading at ${price}.
Sentiment lens: ${sentiment}. Do NOT use those words explicitly.

Facts (use all as given):
${newsItems}

Instructions:
- Interpret the same facts through the selected lens.
  * If Sentiment = positive → emphasize potential benefits, opportunities, improvements, or strategic rationale.
  * If Sentiment = negative → emphasize challenges, risks, costs, leadership uncertainty, or financial strain.
- Do not invent or alter facts.
- Keep impersonal, factual, and concise.
- Mention current price once.
- End with: "Educational market research. Not investment advice."
- Avoid words: buy, sell, should, recommend, bullish, bearish, optimistic, pessimistic.
- Use neutral verbs: announced, reported, disclosed, completed, filed.`

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a neutral financial writer who creates factual, educational market updates.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    })

    const generatedContent = res.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error("No content generated")
    }

    console.log("[GenerateAlert] Generated successfully with sentiment lens:", sentiment)
    
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
