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
      input: `You are a financial news researcher. Search and summarize recent information about ${company} (${ticker}). Include: company business description and market position, sector and industry context, recent financial results and key metrics, latest corporate developments and news from the past 30 days, and relevant market conditions. Provide specific details with dates and figures. Focus on factual, verifiable information that would be relevant to retail and institutional investors.`
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
    
    const reportPrompt = `You are writing a professional stock newsletter summary for retail and institutional readers.

Use this exact structure:
1. Company Overview
2. Recent Developments
3. Market Context
4. Financial Snapshot
5. Outlook Summary

Tone: factual and balanced.
Length: 250–300 words.
Focus on what the company does, why recent events matter, and the relevance for investors.
Use the web search data provided below.
Avoid hype, filler, and citations.

Variables:
- Company: ${company}
- Ticker: ${ticker}
- Current Price: ${price}
- Sentiment: ${sentiment}

Web search data:
${newsContent}

Write the newsletter summary now in plain text format (no markdown, no headers, no bullet points). Follow the 5-section structure but write in flowing paragraphs.`

    const reportResponse = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional equity research writer for a stock newsletter. Write factual, balanced summaries that inform retail and institutional investors. Your writing should be clear, professional, and free of hype or promotional language. Focus on material information: what the company does, recent developments, market conditions, financial data, and forward-looking context. Write in flowing paragraphs without markdown formatting, headers, or bullet points. Maintain objectivity while incorporating the requested sentiment naturally into your analysis."
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