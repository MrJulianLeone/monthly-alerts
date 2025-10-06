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
  newsItems: string = ""
) {
  try {
    console.log("[GenerateAlert] Starting for:", ticker, company, price, sentiment)

    const prompt = `You are a factual markets writer.

Write a 90-word market update email about ${company} (${ticker}) at ${price}.

Rules:
- Do NOT use words like: positive, negative, bullish, bearish, favorable, cautious, optimistic
- No predictions, targets, or advice words: buy, sell, should, recommend
- Use neutral verbs: reported, filed, announced, completed
- Mention current price once
- Keep factual and educational tone

${newsItems ? `Recent news to include:\n${newsItems}\n\nFormat these news items as evidence bullets in your update.` : 'Include any relevant recent company developments you know about.'}

Structure:
- Opening sentence with current price
- 2-3 brief factual points about recent company activity
- One line: "Why this matters:" + neutral fact
- End with: "Educational market research. Not investment advice."

Keep under 90 words total.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a factual markets writer who creates concise, educational market updates.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error("No content generated")
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
