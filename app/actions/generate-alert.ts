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

    // Step 1: Fetch current news using gpt-4o-mini with web search
    console.log("[GenerateAlert] Step 1: Fetching recent news with web search...")
    const newsResponse = await client.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search" }],
      input: `You are a financial news researcher. Fetch and summarize 3-5 recent verified news items about ${company} (${ticker}). Include company business description, sector, recent financial results, and latest corporate developments. Include specific details like dates, financial figures, and key developments. Focus on factual information from the past 30 days.`
    })

    const newsContent = newsResponse.output_text?.trim()
    
    if (!newsContent || newsContent.length < 20) {
      return {
        error: `Unable to fetch recent news for ${ticker}. Please try again.`,
      }
    }

    console.log("[GenerateAlert] Step 1 complete: News fetched")

    // Step 2: Write newsletter using GPT-5
    console.log("[GenerateAlert] Step 2: Writing alert with GPT-5...")
    
    const reportPrompt = `Company: ${company} (${ticker})
Price: ${price}
Sentiment: ${sentiment}

Recent news and data:
${newsContent}

Generate a concise, text-based newsletter alert using the information above. Use the ${sentiment} tone.

Format (plain text, no markdown):

${company} (${ticker}) - ${price}

Company Description:
[2-3 sentences describing what the company does and its market position]

Recent Developments:
[3-4 bullet points with specific recent news, dates, and developments from the past 30 days]

Summary of Opportunity:
[2-3 sentences explaining why this matters to investors, using ${sentiment} tone]

Write in under 150 words total. Be factual and concise. No price ranges, intraday data, volume figures, or percentage changes. No investment advice or recommendations.`

    const reportResponse = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a concise equity research writer for a stock alert newsletter. Write clear, factual company reports in plain text format. Focus on: (1) what the company does, (2) specific recent developments with dates, and (3) why it matters to investors. Match the requested sentiment tone (positive or negative) while staying professional and data-driven. Avoid market data like price ranges, volume, intraday changes, or percentages. No investment advice or price targets."
        },
        {
          role: "user",
          content: reportPrompt
        }
      ]
    })

    const out = reportResponse.choices?.[0]?.message?.content?.trim()

    if (!out || out.length < 20) {
      return {
        error: `Unable to generate alert content for ${ticker}. Please try again.`,
      }
    }

    // Success!
    console.log("[GenerateAlert] Step 2 complete: Alert generated successfully with GPT-5")
    
    const sentimentLabel = sentiment === "positive" ? "Positive Alert" : "Negative Alert"
    const subject = `${company} (${ticker}) - ${sentimentLabel}`

    return {
      success: true,
      subject,
      content: out,
    }
  } catch (error: any) {
    console.error("[GenerateAlert] Error:", error)
    return {
      error: error.message || "Failed to generate alert.",
    }
  }
}