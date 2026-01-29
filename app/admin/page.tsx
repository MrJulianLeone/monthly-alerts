import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Mail, LogOut, Send, MessageSquare, UserPlus, Upload, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { getAllCampaignStats } from "@/app/actions/campaign"
import AdminCampaignsTable from "./campaigns/admin-campaigns-table"
import { getTodayPageViews } from "@/app/actions/page-views"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

// Force dynamic rendering and no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) redirect("/dashboard")

  // Fetch today's home page views
  const todayHomePageViews = await getTodayPageViews("/")

  // Fetch statistics (only verified users)
  const totalUsersResult = await sql`
    SELECT COUNT(*) as count FROM users WHERE email_verified = TRUE
  `
  const totalUsers = Number(totalUsersResult[0].count)

  const activeSubscriptionsResult = await sql`
    SELECT COUNT(*) as count FROM subscriptions s
    WHERE s.status = 'active'
  `
  const activeSubscriptions = Number(activeSubscriptionsResult[0].count)

  const totalAlertsResult = await sql`
    SELECT COUNT(*) as count FROM alerts
  `
  const totalAlerts = Number(totalAlertsResult[0].count)

  const totalMessagesResult = await sql`
    SELECT COUNT(*) as count FROM messages
  `
  const totalMessages = Number(totalMessagesResult[0].count)

  const totalArticlesResult = await sql`
    SELECT COUNT(*) as count FROM research_articles
  `
  const totalArticles = Number(totalArticlesResult[0]?.count || 0)

  // Fetch campaign stats for the campaign leads table
  const campaigns = await getAllCampaignStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MonthlyAlerts.com</span>
            </Link>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor user growth and manage monthly alerts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Views Today</h3>
              <Eye className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{todayHomePageViews.toLocaleString()}</p>
          </Card>

          <Link href="/admin/users">
            <Card className="p-4 sm:p-6 hover:border-primary transition-colors cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Users</h3>
                <Users className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{totalUsers}</p>
            </Card>
          </Link>

          <Link href="/admin/subscriptions">
            <Card className="p-4 sm:p-6 hover:border-primary transition-colors cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Subscribers</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{activeSubscriptions}</p>
            </Card>
          </Link>

          <Link href="/admin/alerts">
            <Card className="p-4 sm:p-6 hover:border-primary transition-colors cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Alerts</h3>
                <Mail className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{totalAlerts}</p>
            </Card>
          </Link>

          <Link href="/admin/messages">
            <Card className="p-4 sm:p-6 hover:border-primary transition-colors cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Messages</h3>
                <MessageSquare className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{totalMessages}</p>
            </Card>
          </Link>

          <Link href="/admin/research">
            <Card className="p-4 sm:p-6 hover:border-primary transition-colors cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Research</h3>
                <FileText className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{totalArticles}</p>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 sm:hidden">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link href="/admin/send-alert">
              <Button className="w-full justify-center">
                <Send className="h-4 w-4 mr-2" />
                Send Alert
              </Button>
            </Link>
            <Link href="/admin/send-message">
              <Button className="w-full justify-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </Link>
            <Link href="/admin/add-subscriber">
              <Button className="w-full justify-center">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
            </Link>
            <Link href="/admin/upload-sample-report">
              <Button className="w-full justify-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload Sample
              </Button>
            </Link>
            <Link href="/admin/generate-article">
              <Button className="w-full justify-center">
                <FileText className="h-4 w-4 mr-2" />
                New Research
              </Button>
            </Link>
          </div>
        </div>

        {/* Campaign Leads */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Campaign Leads</h2>
          <p className="text-sm text-muted-foreground">
            URL: <code className="text-xs bg-muted px-2 py-1 rounded">https://monthlyalerts.com/campaign/[ID]</code>
          </p>
        </div>

        <AdminCampaignsTable campaigns={campaigns} />
      </div>
    </div>
  )
}