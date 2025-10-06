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

    const prompt = `You are a financial research writer. 
Write a short, factual, 90-word market update email about a public company.

Input:
Ticker: ${ticker}
Company: ${company}
Current Price: ${price}
Indicator: ${sentiment}

Instructions:
- Tone matches the indicator: optimistic if positive, cautious if negative.
- Mention current price and 1–2 factual context points (recent news, volume trend, sector movement).
- Do not include any predictions, targets, or advice words like "buy," "sell," or "should."
- Keep impersonal and educational in tone.
- End with: "Educational market research. Not investment advice."`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a financial research writer who creates factual, educational market updates.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
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
