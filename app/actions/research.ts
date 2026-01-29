"use server"

import OpenAI from "openai"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

const sql = neon(process.env.DATABASE_URL!)

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100)
}

export async function generateResearchArticle(topic: string) {
  try {
    // Check admin authentication
    const session = await getSession()
    if (!session) {
      redirect("/login")
    }

    const adminCheck = await isAdmin(session.user_id)
    if (!adminCheck) {
      return { error: "Unauthorized: Admin access required" }
    }

    if (!topic || topic.trim().length < 3) {
      return { error: "Please provide a valid research topic" }
    }

    console.log("[GenerateArticle] Starting research article generation for topic:", topic)

    // Step 1: Use web search to gather current information
    console.log("[GenerateArticle] Step 1: Gathering research data with web search...")
    const researchResponse = await client.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search" }],
      input: `You are a financial research analyst. Search and compile comprehensive information about: ${topic}. 
      
      Focus on:
      - Current market data, statistics, and trends
      - Recent news and developments (from the past 3-6 months)
      - Expert opinions and analyst perspectives
      - Historical context and background
      - Key players and companies involved
      - Regulatory and policy considerations
      - Future outlook and projections
      
      Provide detailed factual information with specific data points, dates, and sources where available.`
    })

    const researchContent = researchResponse.output_text?.trim()

    if (!researchContent || researchContent.length < 100) {
      return {
        error: "Unable to gather research data for this topic. Please try again with a different topic.",
      }
    }

    console.log("[GenerateArticle] Step 1 complete: Research data gathered")

    // Step 2: Generate the full article with GPT-5
    console.log("[GenerateArticle] Step 2: Writing article with GPT-5...")
    
    const articlePrompt = `You are writing a comprehensive research report for MonthlyAlerts.com, a financial research publication.

Topic: ${topic}

Using the research data provided below, write a detailed research article that includes:

1. **Executive Summary** - A brief overview of the key findings (2-3 paragraphs)
2. **Background & Context** - Historical context and why this topic matters now
3. **Current Market Analysis** - Present state, key metrics, and recent developments
4. **Key Players & Trends** - Major companies, institutions, or factors driving this space
5. **Challenges & Risks** - Potential headwinds, regulatory concerns, or market risks
6. **Future Outlook** - Projections, expert opinions, and what to watch
7. **Conclusion** - Summary of key takeaways for investors

Important guidelines:
- Write in a professional, objective tone suitable for retail and institutional investors
- Include specific data points, percentages, and figures where available
- Add inline citations in the format [Source Name, Date] for key facts and statistics
- Use clear section headers with ## markdown formatting
- Total length should be 1500-2500 words
- Avoid promotional language or investment recommendations
- Focus on educating the reader about the topic

Research data:
${researchContent}

Write the full research article now.`

    const articleResponse = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a senior financial research analyst writing for a professional investment research publication. Your articles are well-researched, factual, and balanced. You cite sources properly and avoid speculation or hype. Your writing is clear, engaging, and accessible to both retail and institutional investors."
        },
        {
          role: "user",
          content: articlePrompt
        }
      ]
    })

    const articleContent = articleResponse.choices?.[0]?.message?.content?.trim()

    if (!articleContent || articleContent.length < 500) {
      return {
        error: "Unable to generate article content. Please try again.",
      }
    }

    console.log("[GenerateArticle] Step 2 complete: Article generated")

    // Step 3: Generate title and meta description
    console.log("[GenerateArticle] Step 3: Generating title and meta description...")
    
    const metaResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You generate SEO-optimized titles and meta descriptions for financial research articles. Output in JSON format."
        },
        {
          role: "user",
          content: `Based on this research article about "${topic}", generate:
1. A compelling, SEO-friendly title (60-70 characters)
2. A meta description for search engines (150-160 characters)

Article excerpt:
${articleContent.substring(0, 1500)}

Respond in JSON format:
{"title": "...", "meta_description": "..."}`
        }
      ],
      response_format: { type: "json_object" }
    })

    let title = `Research Report: ${topic}`
    let metaDescription = `Comprehensive research analysis on ${topic} including market trends, key players, and future outlook.`

    try {
      const metaContent = metaResponse.choices?.[0]?.message?.content
      if (metaContent) {
        const parsed = JSON.parse(metaContent)
        if (parsed.title) title = parsed.title
        if (parsed.meta_description) metaDescription = parsed.meta_description
      }
    } catch (e) {
      console.log("[GenerateArticle] Using fallback title/meta")
    }

    // Generate unique slug
    const baseSlug = generateSlug(title)
    const timestamp = Date.now().toString(36)
    const slug = `${baseSlug}-${timestamp}`

    // Save to database
    console.log("[GenerateArticle] Saving article to database...")
    const result = await sql`
      INSERT INTO research_articles (slug, title, topic, content, meta_description, created_by)
      VALUES (${slug}, ${title}, ${topic}, ${articleContent}, ${metaDescription}, ${session.user_id}::uuid)
      RETURNING id, slug
    `

    console.log("[GenerateArticle] Article published successfully:", slug)

    return {
      success: true,
      slug: result[0].slug,
      title,
      articleId: result[0].id
    }
  } catch (error: any) {
    console.error("[GenerateArticle] Error:", error)
    return {
      error: error.message || "Failed to generate article.",
    }
  }
}

export async function getResearchArticles() {
  const articles = await sql`
    SELECT id, slug, title, topic, meta_description, published_at, created_at
    FROM research_articles
    ORDER BY published_at DESC
  `
  return articles
}

export async function getResearchArticleBySlug(slug: string) {
  const result = await sql`
    SELECT id, slug, title, topic, content, meta_description, published_at, created_at
    FROM research_articles
    WHERE slug = ${slug}
    LIMIT 1
  `
  return result[0] || null
}

export async function getLatestResearchArticle() {
  const result = await sql`
    SELECT id, slug, title, topic, content, meta_description, published_at, created_at
    FROM research_articles
    ORDER BY published_at DESC
    LIMIT 1
  `
  return result[0] || null
}

export async function deleteResearchArticle(articleId: string) {
  try {
    // Check admin authentication
    const session = await getSession()
    if (!session) {
      redirect("/login")
    }

    const adminCheck = await isAdmin(session.user_id)
    if (!adminCheck) {
      return { error: "Unauthorized: Admin access required" }
    }

    await sql`
      DELETE FROM research_articles WHERE id = ${articleId}::uuid
    `

    console.log("[DeleteArticle] Successfully deleted article:", articleId)
    return { success: true }
  } catch (error: any) {
    console.error("[DeleteArticle] Error:", error)
    return { error: error.message || "Failed to delete article" }
  }
}
