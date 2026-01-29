import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Create research_articles table
    await sql`
      CREATE TABLE IF NOT EXISTS research_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        topic VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        meta_description VARCHAR(320),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_research_articles_slug ON research_articles(slug)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_research_articles_published_at ON research_articles(published_at DESC)
    `
    
    return NextResponse.json({ 
      success: true, 
      message: "Research articles table created successfully" 
    })
  } catch (error: any) {
    console.error("Migration error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
